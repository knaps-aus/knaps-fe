import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { API_BASE_URL } from "@/config";

interface Deal {
  id: number;
  deal_uuid: string;
  product_name?: string;
  deal_type?: string;
}

interface DealSearchProps {
  onSelectDeal: (dealId: number) => void;
}

export default function DealSearch({ onSelectDeal }: DealSearchProps) {
  const [query, setQuery] = useState("");
  const [showResults, setShowResults] = useState(false);

  const { data: searchResults = [] } = useQuery<Deal[]>({
    queryKey: ["/deals/search", query],
    queryFn: async () => {
      if (query.length < 2) return [];
      const response = await fetch(
        `${API_BASE_URL}/deals/search?q=${encodeURIComponent(query)}`,
      );
      if (!response.ok) throw new Error("Search failed");
      return response.json();
    },
    enabled: query.length >= 2,
  });

  useEffect(() => {
    setShowResults(query.length >= 2 && searchResults.length > 0);
  }, [query, searchResults]);

  const handleSelect = (deal: Deal) => {
    onSelectDeal(deal.id);
    setQuery(deal.product_name || deal.deal_uuid);
    setShowResults(false);
  };

  return (
    <div className="relative">
      <div className="relative">
        <Input
          type="text"
          placeholder="Search deals by product..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => query.length >= 2 && setShowResults(true)}
          className="w-full pl-10 pr-4 py-2"
        />
        <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
      </div>

      {showResults && (
        <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-lg mt-1 max-h-60 overflow-y-auto z-50">
          {searchResults.map((deal) => (
            <div
              key={deal.id}
              className="p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
              onClick={() => handleSelect(deal)}
            >
              <div className="font-medium text-gray-900">
                {deal.product_name || deal.deal_uuid}
              </div>
              {deal.deal_type && (
                <div className="text-sm text-gray-600">{deal.deal_type}</div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
