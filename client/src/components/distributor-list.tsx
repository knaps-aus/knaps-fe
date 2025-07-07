import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import type { Distributor, Brand } from "@shared/schema";

export default function DistributorList() {
  const { data: distributors = [], isLoading } = useQuery<Distributor[]>({
    queryKey: ["/distributors"],
  });
  const { data: brands = [] } = useQuery<Brand[]>({
    queryKey: ["/brands"],
  });

  const [selected, setSelected] = useState<Distributor | null>(null);

  const brandNames = (id: number) =>
    brands.filter((b) => b.distributor_id === id).map((b) => b.name).join(", ");

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
                    onClick={() => setSelected(dist)}
                    className="cursor-pointer hover:bg-gray-50"
                  >
                    <TableCell>{dist.store}</TableCell>
                    <TableCell>{dist.name}</TableCell>
                    <TableCell>{brandNames(dist.id) || "-"}</TableCell>
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
      {selected && (
        <Dialog
          open={!!selected}
          onOpenChange={(open) => !open && setSelected(null)}
        >
          <DialogContent className="max-w-md">
            <Card>
              <CardHeader>
                <CardTitle>{selected.name}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div>
                  <strong>Store:</strong> {selected.store}
                </div>
                <div>
                  <strong>Business Number:</strong> {selected.business_number || "-"}
                </div>
                <div>
                  <strong>Purchaser:</strong> {selected.modified_by}
                </div>
                <div>
                  <strong>Active:</strong> {selected.active ? "Yes" : "No"}
                </div>
                <div>
                  <strong>Brands:</strong> {brandNames(selected.id) || "-"}
                </div>
              </CardContent>
            </Card>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
