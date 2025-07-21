import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { Product } from "@shared/schema";
import { API_BASE_URL } from "@/config";
import { authHeaders } from "@/lib/auth";

interface ProductSearchProps {
  onSelectProduct: (productCode: string) => void;
}

export default function ProductSearch({ onSelectProduct }: ProductSearchProps) {
  const [query, setQuery] = useState("");
  const [showResults, setShowResults] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const { data: searchResults = [] } = useQuery<Product[]>({
    queryKey: ['/products/search', query, selectedProduct?.id],
    queryFn: async () => {
      if (query.length < 2 || selectedProduct) return [];
      const response = await fetch(
        `${API_BASE_URL}/products/search?q=${encodeURIComponent(query)}`,
        { headers: authHeaders() },
      );
      if (!response.ok) throw new Error('Search failed');
      return response.json();
    },
    enabled: query.length >= 2,
  });

  useEffect(() => {
    setShowResults(query.length >= 2 && searchResults.length > 0 && !selectedProduct);
  }, [query, searchResults, selectedProduct]);

  const handleSelectProduct = (product: Product) => {
    onSelectProduct(product.product_code);
    setQuery(product.product_name);
    setSelectedProduct(product);
    setShowResults(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setQuery(newValue);
    if (selectedProduct && newValue !== selectedProduct.product_name) {
      setSelectedProduct(null);
    }
  };

  return (
    <div className="relative">
      <div className="relative">
        <Input
          type="text"
          placeholder="Search products by name, code, or brand..."
          value={query}
          onChange={handleInputChange}
          onFocus={() => query.length >= 2 && !selectedProduct && setShowResults(true)}
          className="w-full pl-10 pr-4 py-2"
        />
        <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
      </div>
      {showResults && (
        <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-lg mt-1 max-h-60 overflow-y-auto z-50">
          {searchResults.map((product) => (
            <div
              key={product.id}
              className="p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
              onClick={() => handleSelectProduct(product)}
            >
              <div className="font-medium text-gray-900">{product.product_name}</div>
              <div className="text-sm text-gray-500">{product.product_code}</div>
              <div className="text-sm text-gray-600">{product.brand_name}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
