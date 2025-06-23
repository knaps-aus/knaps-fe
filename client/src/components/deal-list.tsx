import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Deal } from "@shared/schema";

interface DealListProps {
  productId: number | null;
}

export default function DealList({ productId }: DealListProps) {
  const { data: deals = [], isLoading } = useQuery<Deal[]>({
    queryKey: ['/deals', productId],
    enabled: !!productId,
  });

  if (!productId) {
    return (
      <div className="p-6 text-center">
        <p className="text-gray-500">Select a product from the search to view deals</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="p-6">Loading...</div>
    );
  }

  if (deals.length === 0) {
    return (
      <div className="p-6 text-center text-gray-500">No deals found for this product</div>
    );
  }

  return (
    <div className="p-6">
      <Card>
        <CardHeader>
          <CardTitle>Deals</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Type</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Start</TableHead>
                <TableHead>End</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {deals.map((deal) => (
                <TableRow key={deal.deal_id}>
                  <TableCell>{deal.deal_type}</TableCell>
                  <TableCell>{deal.amount}</TableCell>
                  <TableCell>{deal.start_date}</TableCell>
                  <TableCell>{deal.end_date}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
