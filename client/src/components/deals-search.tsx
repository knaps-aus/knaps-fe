import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Filter } from "lucide-react";
import ProductSearchWithId from "@/components/product-search-with-id";
import DealAdvancedSearch from "@/components/deal-advanced-search";
import { Product } from "@shared/schema";

interface DealsSearchProps {
  onSelectProduct: (product: Product) => void;
  onAdvancedSearch: (filters: {
    dealType?: number;
    dealStatus?: string;
    distributor?: string;
    brand?: string;
  }) => void;
}

export default function DealsSearch({ onSelectProduct, onAdvancedSearch }: DealsSearchProps) {
  const [isAdvancedMode, setIsAdvancedMode] = useState(false);

  const handleToggleMode = () => {
    setIsAdvancedMode(!isAdvancedMode);
  };

  const handleAdvancedSearch = (filters: {
    dealType?: number;
    dealStatus?: string;
    distributor?: string;
    brand?: string;
  }) => {
    onAdvancedSearch(filters);
  };

  if (isAdvancedMode) {
    return (
      <DealAdvancedSearch
        onSearch={handleAdvancedSearch}
        onToggleMode={handleToggleMode}
      />
    );
  }

  return (
    <div className="w-full max-w-lg mx-auto space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-900">Search Deals</h3>
        <Button variant="outline" size="sm" onClick={handleToggleMode}>
          <Filter className="h-4 w-4 mr-2" />
          Advanced Search
        </Button>
      </div>
      
      <ProductSearchWithId onSelectProduct={onSelectProduct} />
    </div>
  );
} 