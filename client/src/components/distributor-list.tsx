import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Edit, Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Distributor, Brand } from "@shared/schema";
import { useEffect } from "react";

export default function DistributorList() {
  const { data: distributors = [], isLoading } = useQuery<Distributor[]>({
    queryKey: ["/distributors"],
  });
  const { data: brands = [] } = useQuery<Brand[]>({
    queryKey: ["/brands"],
  });

  const [distQuery, setDistQuery] = useState("");
  const [brandQuery, setBrandQuery] = useState("");
  const { data: distSearch = [], isLoading: distSearchLoading } = useQuery<Distributor[]>({
    queryKey: ["/distributors/search?q=", distQuery],
    enabled: distQuery.length >= 2,
  });
  const { data: brandSearch = [], isLoading: brandSearchLoading } = useQuery<Brand[]>({
    queryKey: ["/brands/search?q=", brandQuery],
    enabled: brandQuery.length >= 2,
  });

  const [page, setPage] = useState(0);
  const ITEMS_PER_PAGE = 10;

  const [selected, setSelected] = useState<Distributor | null>(null);
  const [distForm, setDistForm] = useState<Distributor | null>(null);
  const [editingDist, setEditingDist] = useState(false);

  const { toast } = useToast();

  const updateDistMutation = useMutation({
    mutationFn: async (data: Partial<Distributor>) => {
      if (!selected) return;
      const res = await apiRequest(
        "PUT",
        `/distributors/${selected.uuid}`,
        data,
      );
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/distributors"] });
      setEditingDist(false);
      toast({
        title: "Success",
        description: "Distributor updated successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update distributor",
        variant: "destructive",
      });
    },
  });

  const brandBadges = (id: number) =>
    brands
      .filter((b) => b.distributor_id === id)
      .map((b) => (
        <Badge key={b.id} variant="secondary">
          {b.name}
        </Badge>
      ));

  let displayDistributors = distQuery.length >= 2 ? distSearch : distributors;
  if (brandQuery.length >= 2) {
    const brandIds = new Set(brandSearch.map((b) => b.distributor_id));
    displayDistributors = displayDistributors.filter((d) =>
      brandIds.has(d.id),
    );
  }

  const totalPages = Math.ceil(displayDistributors.length / ITEMS_PER_PAGE);
  const paginated = displayDistributors.slice(
    page * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE + ITEMS_PER_PAGE,
  );

  useEffect(() => {
    setPage(0);
  }, [distQuery, brandQuery]);

  if (isLoading) {
    return <div className="p-6">Loading...</div>;
  }

  if (distributors.length === 0) {
    return (
      <div className="p-6 text-center text-gray-500">No distributors found</div>
    );
  }

  return (
    <div className="p-6">
      <Card>
        <CardHeader>
          <CardTitle>Distributors &amp; Brands</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-4">
            <div className="flex-1">
              <Input
                placeholder="Search distributors..."
                value={distQuery}
                onChange={(e) => setDistQuery(e.target.value)}
              />
              {distQuery.length >= 2 && (
                <div className="text-xs text-gray-500 mt-1">
                  {distSearchLoading ? "Searching..." : `Found ${distSearch.length} results`}
                </div>
              )}
            </div>
            <div className="flex-1">
              <Input
                placeholder="Search brands..."
                value={brandQuery}
                onChange={(e) => setBrandQuery(e.target.value)}
              />
              {brandQuery.length >= 2 && (
                <div className="text-xs text-gray-500 mt-1">
                  {brandSearchLoading ? "Searching..." : `Found ${brandSearch.length} results`}
                </div>
              )}
            </div>
          </div>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Store</TableHead>
                  <TableHead>Distributor</TableHead>
                  <TableHead>Brands</TableHead>
                  <TableHead>Business Number</TableHead>
                  <TableHead>Purchaser</TableHead>
                  <TableHead>Is Active</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginated.map((dist) => (
                  <TableRow
                    key={dist.id}
                    onClick={() => {
                      setSelected(dist);
                      setDistForm(dist);
                      setEditingDist(false);
                    }}
                    className="cursor-pointer hover:bg-gray-50"
                  >
                    <TableCell>{dist.store}</TableCell>
                    <TableCell>{dist.name}</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {brandBadges(dist.id)}
                      </div>
                    </TableCell>
                    <TableCell>{dist.business_number || "-"}</TableCell>
                    <TableCell>{dist.modified_by}</TableCell>
                    <TableCell>{dist.active ? "Yes" : "No"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <div className="flex items-center justify-between mt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.max(p - 1, 0))}
                disabled={page === 0}
              >
                Previous
              </Button>
              <span className="text-sm">
                Page {page + 1} of {totalPages || 1}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.min(p + 1, totalPages - 1))}
                disabled={page + 1 >= totalPages}
              >
                Next
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
      {selected && distForm && (
        <Dialog
          open={!!selected}
          onOpenChange={(open) => !open && setSelected(null)}
        >
          <DialogContent className="max-w-4xl">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>{selected.name}</CardTitle>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setEditingDist(!editingDist)}
                  >
                    <Edit className="h-4 w-4 mr-1" />
                    {editingDist ? "Cancel" : "Edit"}
                  </Button>
                  {editingDist && (
                    <Button
                      type="button"
                      size="sm"
                      onClick={() => updateDistMutation.mutate(distForm)}
                      disabled={updateDistMutation.isPending}
                    >
                      <Save className="h-4 w-4 mr-1" />
                      {updateDistMutation.isPending ? "Saving..." : "Save"}
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="text-sm font-medium">Code</label>
                    <Input value={distForm.code} disabled readOnly />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Name</label>
                    <Input
                      value={distForm.name}
                      onChange={(e) =>
                        setDistForm({ ...distForm, name: e.target.value })
                      }
                      disabled={!editingDist}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Business Number</label>
                    <Input
                      value={distForm.business_number || ""}
                      onChange={(e) =>
                        setDistForm({
                          ...distForm,
                          business_number: e.target.value,
                        })
                      }
                      disabled={!editingDist}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">GLN</label>
                    <Input
                      value={distForm.gln || ""}
                      onChange={(e) =>
                        setDistForm({ ...distForm, gln: e.target.value })
                      }
                      disabled={!editingDist}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Purchaser</label>
                    {editingDist ? (
                      <Select
                        value={distForm.store}
                        onValueChange={(v) =>
                          setDistForm({ ...distForm, store: v })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select purchaser" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Purchaser A">Purchaser A</SelectItem>
                          <SelectItem value="Purchaser B">Purchaser B</SelectItem>
                          <SelectItem value="Purchaser C">Purchaser C</SelectItem>
                        </SelectContent>
                      </Select>
                    ) : (
                      <Input value={distForm.store} disabled />
                    )}
                  </div>
                  <div>
                    <label className="text-sm font-medium">Price Protection Claim From</label>
                    <Input
                      type="date"
                      value={distForm.pp_claim_from || ""}
                      onChange={(e) =>
                        setDistForm({
                          ...distForm,
                          pp_claim_from: e.target.value,
                        })
                      }
                      disabled={!editingDist}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Accounting End of Month (Day)</label>
                    <Input
                      type="number"
                      value={distForm.accounting_date ?? ""}
                      onChange={(e) =>
                        setDistForm({
                          ...distForm,
                          accounting_date: e.target.value ? Number(e.target.value) : null,
                        })
                      }
                      disabled={!editingDist}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Default Extended Credit Days</label>
                    {editingDist ? (
                      <Select
                        value={distForm.default_extended_credits_code || ""}
                        onValueChange={(v) =>
                          setDistForm({
                            ...distForm,
                            default_extended_credits_code: v,
                            default_extended_credits_name: `${v} Days`,
                          })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select days" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="30">30 Days</SelectItem>
                          <SelectItem value="60">60 Days</SelectItem>
                          <SelectItem value="90">90 Days</SelectItem>
                        </SelectContent>
                      </Select>
                    ) : (
                      <Input
                        value={distForm.default_extended_credits_name || ""}
                        disabled
                      />
                    )}
                  </div>
                  <div>
                    <label className="text-sm font-medium">FIS Minimum Order ($)</label>
                    <Input
                      type="number"
                      value={distForm.fis_minimum_order || ""}
                      onChange={(e) =>
                        setDistForm({
                          ...distForm,
                          fis_minimum_order: e.target.value,
                        })
                      }
                      disabled={!editingDist}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Web Portal URL</label>
                    <Input
                      value={distForm.web_portal_url || ""}
                      onChange={(e) =>
                        setDistForm({
                          ...distForm,
                          web_portal_url: e.target.value,
                        })
                      }
                      disabled={!editingDist}
                    />
                  </div>
                  <div className="flex items-center space-x-2 pt-6">
                    <Switch
                      id="edi"
                      checked={distForm.edi}
                      onCheckedChange={(v) =>
                        setDistForm({ ...distForm, edi: v as boolean })
                      }
                      disabled={!editingDist}
                    />
                    <label htmlFor="edi" className="text-sm font-medium">
                      Uses EDI
                    </label>
                  </div>
                  <div className="flex items-center space-x-2 pt-6">
                    <Switch
                      id="auto-claim"
                      checked={distForm.auto_claim_over_charge}
                      onCheckedChange={(v) =>
                        setDistForm({
                          ...distForm,
                          auto_claim_over_charge: v as boolean,
                        })
                      }
                      disabled={!editingDist}
                    />
                    <label htmlFor="auto-claim" className="text-sm font-medium">
                      Auto Claim Over Charge
                    </label>
                  </div>
                  <div className="flex items-center space-x-2 pt-6">
                    <Checkbox
                      id="active-dist"
                      checked={distForm.active}
                      onCheckedChange={(v) =>
                        setDistForm({ ...distForm, active: !!v })
                      }
                      disabled={!editingDist}
                    />
                    <label htmlFor="active-dist" className="text-sm font-medium">
                      Active
                    </label>
                  </div>
                </div>

                <div className="mt-6">
                  <h3 className="text-md font-medium mb-2">Brands</h3>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Code</TableHead>
                          <TableHead>Name</TableHead>
                          <TableHead>Store</TableHead>
                          <TableHead>Active</TableHead>
                          <TableHead className="w-16"></TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {brands
                          .filter((b) => b.distributor_id === selected.id)
                          .map((brand) => (
                            <BrandRow key={brand.id} brand={brand} />
                          ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              </CardContent>
            </Card>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

function BrandRow({ brand }: { brand: Brand }) {
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState(brand);
  const { toast } = useToast();

  const mutation = useMutation({
    mutationFn: async (data: Partial<Brand>) => {
      const res = await apiRequest("PUT", `/brands/${brand.uuid}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/brands"] });
      setIsEditing(false);
      toast({ title: "Success", description: "Brand updated" });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update brand",
        variant: "destructive",
      });
    },
  });

  const handleSave = () => mutation.mutate(form);

  return (
    <TableRow className={isEditing ? "bg-muted/50" : undefined}>
      <TableCell>
        {isEditing ? (
          <Input
            value={form.code}
            onChange={(e) => setForm({ ...form, code: e.target.value })}
          />
        ) : (
          brand.code
        )}
      </TableCell>
      <TableCell>
        {isEditing ? (
          <Input
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
        ) : (
          brand.name
        )}
      </TableCell>
      <TableCell>
        {isEditing ? (
          <Input
            value={form.store}
            onChange={(e) => setForm({ ...form, store: e.target.value })}
          />
        ) : (
          brand.store
        )}
      </TableCell>
      <TableCell>
        {isEditing ? (
          <Checkbox
            checked={form.active}
            onCheckedChange={(v) => setForm({ ...form, active: !!v })}
          />
        ) : brand.active ? (
          "Yes"
        ) : (
          "No"
        )}
      </TableCell>
      <TableCell>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => (isEditing ? handleSave() : setIsEditing(true))}
          disabled={mutation.isPending}
        >
          {isEditing ? (
            <Save className="h-4 w-4" />
          ) : (
            <Edit className="h-4 w-4" />
          )}
        </Button>
      </TableCell>
    </TableRow>
  );
}
