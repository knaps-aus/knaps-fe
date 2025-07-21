import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Edit } from "lucide-react";
import AddDeal from "@/components/add-deal";
import { Deal } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";

interface DealsListProps {
  productId?: number | null;
  searchFilters?: {
    dealType?: number;
    dealStatus?: string;
    distributor?: string;
    brand?: string;
  };
}

export default function DealsList({ productId, searchFilters }: DealsListProps) {
  const [editingDeal, setEditingDeal] = useState<Deal | null>(null);

  // Determine if we're using advanced search or product-based search
  const isAdvancedSearch = searchFilters && Object.values(searchFilters).some(value => value !== undefined);

  const { data: deals = [], isLoading } = useQuery<Deal[]>({
    queryKey: isAdvancedSearch 
      ? ['/deals/search', searchFilters]
      : ['/deals', productId],
    queryFn: async () => {
      if (isAdvancedSearch) {
        // Build query parameters for advanced search
        const params = new URLSearchParams();
        if (searchFilters?.dealType) params.append('deal_type', searchFilters.dealType.toString());
        if (searchFilters?.dealStatus) params.append('status', searchFilters.dealStatus);
        if (searchFilters?.distributor) params.append('distributor', searchFilters.distributor);
        if (searchFilters?.brand) params.append('brand', searchFilters.brand);
        
        const response = await apiRequest("GET", `/deals/search?${params.toString()}`);
        return response.json();
      } else {
        // Product-based search
        if (!productId) return [];
        const response = await apiRequest("GET", `/deals?product_id=${productId}`);
        return response.json();
      }
    },
    enabled: isAdvancedSearch || !!productId,
  });

  if (!isAdvancedSearch && !productId) {
    return (
      <div className="p-6 text-center">
        <p className="text-gray-500">Select a product from the search to view deals</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
        </div>
      </div>
    );
  }

  if (deals.length === 0) {
    return (
      <div className="p-6 text-center text-gray-500">
        {isAdvancedSearch 
          ? "No deals found matching your search criteria" 
          : "No deals found for this product"
        }
      </div>
    );
  }

  return (
    <div className="p-6">
      <Card>
        <CardHeader>
          <CardTitle>
            {isAdvancedSearch ? "Search Results" : "Deals"}
            {deals.length > 0 && (
              <span className="text-sm font-normal text-gray-500 ml-2">
                ({deals.length} {deals.length === 1 ? 'deal' : 'deals'})
              </span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Type</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Start</TableHead>
                <TableHead>End</TableHead>
                <TableHead>Provider</TableHead>
                {isAdvancedSearch && <TableHead>Product</TableHead>}
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {deals.map((deal) => (
                <TableRow key={deal.deal_id}>
                  <TableCell>{deal.deal_type}</TableCell>
                  <TableCell>{deal.amount}</TableCell>
                  <TableCell>{deal.start_date}</TableCell>
                  <TableCell>{deal.end_date}</TableCell>
                  <TableCell>{deal.provider}</TableCell>
                  {isAdvancedSearch && (
                    <TableCell>
                      {/* You might want to fetch and display product info here */}
                      Product ID: {deal.product_id}
                    </TableCell>
                  )}
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setEditingDeal(deal)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      
      <Dialog open={!!editingDeal} onOpenChange={(open) => !open && setEditingDeal(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          {editingDeal && (
            <AddDeal deal={editingDeal} onClose={() => setEditingDeal(null)} />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
} 