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
import { Edit, Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Distributor, Brand } from "@shared/schema";

export default function DistributorList() {
  const { data: distributors = [], isLoading } = useQuery<Distributor[]>({
    queryKey: ["/distributors"],
  });
  const { data: brands = [] } = useQuery<Brand[]>({
    queryKey: ["/brands"],
  });

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
                {distributors.map((dist) => (
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
          </div>
        </CardContent>
      </Card>
      {selected && distForm && (
        <Dialog
          open={!!selected}
          onOpenChange={(open) => !open && setSelected(null)}
        >
          <DialogContent className="max-w-2xl">
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Store</label>
                    <Input
                      value={distForm.store}
                      onChange={(e) =>
                        setDistForm({ ...distForm, store: e.target.value })
                      }
                      disabled={!editingDist}
                    />
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
