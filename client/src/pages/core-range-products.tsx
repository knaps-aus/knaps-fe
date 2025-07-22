import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Sidebar from "@/components/sidebar";
import UserMenu from "@/components/user-menu";
import Filters, { FilterValues } from "@/components/core-range/Filters";
import ProductsTable from "@/components/core-range/ProductsTable";
import TablePagination from "@/components/core-range/Pagination";
import { apiRequest } from "@/lib/queryClient";
import { Store, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Product {
  id: number;
  brand_name?: string;
  product_name?: string;
  core_group?: string;
  [key: string]: any;
}

export default function CoreRangeProducts() {
  const [filters, setFilters] = useState<FilterValues | null>(null);
  const [page, setPage] = useState(0);
  const ITEMS_PER_PAGE = 10;

  const {
    data: products = [],
    isLoading,
    isError,
  } = useQuery<Product[]>({
    queryKey: ["/products/core-range", filters],
    queryFn: async () => {
      if (!filters) return [];
      const params = new URLSearchParams();
      if (filters.distributor_id)
        params.append("distributor_id", String(filters.distributor_id));
      if (filters.brand_id) params.append("brand_id", String(filters.brand_id));
      if (filters.class_id) params.append("class_id", String(filters.class_id));
      if (filters.type_id) params.append("type_id", String(filters.type_id));
      if (filters.category_id)
        params.append("category_id", String(filters.category_id));
      if (filters.core_groups && filters.core_groups.length)
        params.append("core_groups", filters.core_groups.join(","));
      const res = await apiRequest(
        "GET",
        `/products/core-range?${params.toString()}`,
      );
      return res.json();
    },
    enabled: filters !== null,
  });

  const pageCount = Math.max(1, Math.ceil(products.length / ITEMS_PER_PAGE));
  const paginated = products.slice(
    page * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE + ITEMS_PER_PAGE,
  );

  const handleSubmit = (f: FilterValues) => {
    setFilters(f);
    setPage(0);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Store className="text-primary text-2xl mr-3" />
              <h1 className="text-xl font-semibold text-gray-900">Core Range Products</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="icon">
                <Bell className="h-5 w-5 text-gray-400" />
              </Button>
              <UserMenu />
            </div>
          </div>
        </div>
      </header>

      <div className="flex h-screen pt-16">
        <Sidebar />
        <main className="flex-1 overflow-auto p-6">
          <Filters onSubmit={handleSubmit} />
          <ProductsTable products={paginated} loading={isLoading} error={isError} />
          {filters && (
            <TablePagination
              page={page}
              pageCount={pageCount}
              onPageChange={setPage}
            />
          )}
        </main>
      </div>
    </div>
  );
}
