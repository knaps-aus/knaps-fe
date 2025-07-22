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
    brand_id?: number;
    distributor_id?: number;
    deal_type_id?: number;
    status?: string;
    agreement_type?: string;
    deal_source_id?: number;
    provider_code?: string;
    store?: string;
    product_class_id?: number;
    product_type_id?: number;
    product_category_id?: number;
    valid_on_date?: string;
    active_only?: boolean;
  };
}

export default function DealsList({ productId, searchFilters }: DealsListProps) {
  const [editingDeal, setEditingDeal] = useState<Deal | null>(null);

  // Determine if we're using advanced search or product-based search
  const isAdvancedSearch = searchFilters && Object.values(searchFilters).some(value => value !== undefined);

  const { data: deals = [], isLoading } = useQuery<Deal[]>({
    queryKey: isAdvancedSearch 
      ? ['/rebates/agreements/search', searchFilters]
      : ['/deals', productId],
    queryFn: async () => {
      if (isAdvancedSearch) {
        // Build query parameters for GET request
        const params = new URLSearchParams();
        if (searchFilters?.brand_id) params.append('brand_id', searchFilters.brand_id.toString());
        if (searchFilters?.distributor_id) params.append('distributor_id', searchFilters.distributor_id.toString());
        if (searchFilters?.deal_type_id) params.append('deal_type_id', searchFilters.deal_type_id.toString());
        if (searchFilters?.status) params.append('status', searchFilters.status);
        if (searchFilters?.agreement_type) params.append('agreement_type', searchFilters.agreement_type);
        if (searchFilters?.deal_source_id) params.append('deal_source_id', searchFilters.deal_source_id.toString());
        if (searchFilters?.provider_code) params.append('provider_code', searchFilters.provider_code);
        if (searchFilters?.store) params.append('store', searchFilters.store);
        if (searchFilters?.product_class_id) params.append('product_class_id', searchFilters.product_class_id.toString());
        if (searchFilters?.product_type_id) params.append('product_type_id', searchFilters.product_type_id.toString());
        if (searchFilters?.product_category_id) params.append('product_category_id', searchFilters.product_category_id.toString());
        if (searchFilters?.valid_on_date) params.append('valid_on_date', searchFilters.valid_on_date);
        if (searchFilters?.active_only !== undefined) params.append('active_only', searchFilters.active_only.toString());
        
        const response = await apiRequest("GET", `/rebates/agreements/search?${params.toString()}`);
        return response.json();
      } else {
        // Product-based search (keep existing GET endpoint)
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