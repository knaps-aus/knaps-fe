import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Filter, X } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

interface DealType {
  id: number;
  uuid: string;
  code: string;
  name: string;
  store: string;
  rank: number;
  bonus_class: string;
  claimable: boolean;
  deductable: boolean;
  default_provider_id: number | null;
  default_provider: {
    id: number;
    code: string;
    name: string;
  } | null;
  active: boolean;
  modified_by: string;
  modified: string;
  created_by: string;
  created: string;
  deleted_by: string | null;
  deleted: string | null;
}

interface Distributor {
  id: number;
  uuid: string;
  code: string;
  name: string;
  store: string;
  edi: boolean;
  auto_claim_over_charge: boolean;
  is_central: boolean;
  active: boolean;
  modified_by: string;
  modified: string;
  created_by: string;
  created: string;
}

interface Brand {
  id: number;
  uuid: string;
  code: string;
  name: string;
  store: string;
  distributor_id: number;
  is_hof_pref: boolean;
  comments?: string | null;
  narta_rept: boolean;
  active: boolean;
  modified_by: string;
  modified: string;
  created_by: string;
  created: string;
}

interface DealAdvancedSearchProps {
  onSearch: (filters: {
    dealType?: number;
    dealStatus?: string;
    distributor?: string;
    brand?: string;
  }) => void;
  onToggleMode: () => void;
}

export default function DealAdvancedSearch({ onSearch, onToggleMode }: DealAdvancedSearchProps) {
  const [dealType, setDealType] = useState<string>("");
  const [dealStatus, setDealStatus] = useState<string>("");
  const [distributorQuery, setDistributorQuery] = useState("");
  const [brandQuery, setBrandQuery] = useState("");
  const [showDistributorResults, setShowDistributorResults] = useState(false);
  const [showBrandResults, setShowBrandResults] = useState(false);
  const [selectedDistributor, setSelectedDistributor] = useState<Distributor | null>(null);
  const [selectedBrand, setSelectedBrand] = useState<Brand | null>(null);

  // Fetch deal types
  const { data: dealTypes = [] } = useQuery<DealType[]>({
    queryKey: ["/rebates/deal-types"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/rebates/deal-types");
      return response.json();
    },
  });

  // Fetch distributors based on search query
  const { data: distributorResults = [] } = useQuery<Distributor[]>({
    queryKey: ["/distributors/search", distributorQuery],
    queryFn: async () => {
      if (distributorQuery.length < 2) return [];
      const response = await apiRequest("GET", `/distributors/search?q=${encodeURIComponent(distributorQuery)}`);
      return response.json();
    },
    enabled: distributorQuery.length >= 2,
  });

  // Fetch brands based on search query
  const { data: brandResults = [] } = useQuery<Brand[]>({
    queryKey: ["/brands/search", brandQuery],
    queryFn: async () => {
      if (brandQuery.length < 2) return [];
      const response = await apiRequest("GET", `/brands/search?q=${encodeURIComponent(brandQuery)}`);
      return response.json();
    },
    enabled: brandQuery.length >= 2,
  });

  useEffect(() => {
    setShowDistributorResults(distributorQuery.length >= 2 && distributorResults.length > 0);
  }, [distributorQuery, distributorResults]);

  useEffect(() => {
    setShowBrandResults(brandQuery.length >= 2 && brandResults.length > 0);
  }, [brandQuery, brandResults]);

  const handleDistributorSelect = (distributor: Distributor) => {
    setSelectedDistributor(distributor);
    setDistributorQuery(distributor.name);
    setShowDistributorResults(false);
  };

  const handleBrandSelect = (brand: Brand) => {
    setSelectedBrand(brand);
    setBrandQuery(brand.name);
    setShowBrandResults(false);
  };

  const handleSearch = () => {
    onSearch({
      dealType: dealType ? parseInt(dealType) : undefined,
      dealStatus: dealStatus || undefined,
      distributor: selectedDistributor?.name || undefined,
      brand: selectedBrand?.name || undefined,
    });
  };

  const handleClear = () => {
    setDealType("");
    setDealStatus("");
    setDistributorQuery("");
    setBrandQuery("");
    setSelectedDistributor(null);
    setSelectedBrand(null);
    onSearch({});
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-900">Advanced Deal Search</h3>
        <Button variant="outline" size="sm" onClick={onToggleMode}>
          <X className="h-4 w-4 mr-2" />
          Simple Search
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Deal Type Dropdown */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Deal Type
          </label>
          <Select value={dealType} onValueChange={setDealType}>
            <SelectTrigger>
              <SelectValue placeholder="Select deal type" />
            </SelectTrigger>
            <SelectContent>
              {dealTypes.map((type) => (
                <SelectItem key={type.id} value={type.id.toString()}>
                  {type.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Deal Status Dropdown */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Deal Status
          </label>
          <Select value={dealStatus} onValueChange={setDealStatus}>
            <SelectTrigger>
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="expired">Expired</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Distributor Search */}
        <div className="relative">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Distributor
          </label>
          <div className="relative">
            <Input
              type="text"
              placeholder="Search distributors..."
              value={distributorQuery}
              onChange={(e) => setDistributorQuery(e.target.value)}
              onFocus={() => distributorQuery.length >= 2 && setShowDistributorResults(true)}
              className="w-full pl-10 pr-4 py-2"
            />
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          </div>

          {showDistributorResults && (
            <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-lg mt-1 max-h-60 overflow-y-auto z-50">
              {distributorResults.map((distributor) => (
                <div
                  key={distributor.id}
                  className="p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                  onClick={() => handleDistributorSelect(distributor)}
                >
                  <div className="font-medium text-gray-900">{distributor.name}</div>
                  <div className="text-sm text-gray-500">{distributor.code}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Brand Search */}
        <div className="relative">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Brand
          </label>
          <div className="relative">
            <Input
              type="text"
              placeholder="Search brands..."
              value={brandQuery}
              onChange={(e) => setBrandQuery(e.target.value)}
              onFocus={() => brandQuery.length >= 2 && setShowBrandResults(true)}
              className="w-full pl-10 pr-4 py-2"
            />
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          </div>

          {showBrandResults && (
            <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-lg mt-1 max-h-60 overflow-y-auto z-50">
              {brandResults.map((brand) => (
                <div
                  key={brand.id}
                  className="p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                  onClick={() => handleBrandSelect(brand)}
                >
                  <div className="font-medium text-gray-900">{brand.name}</div>
                  <div className="text-sm text-gray-500">{brand.code}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4">
        <Button onClick={handleSearch} className="flex items-center gap-2">
          <Filter className="h-4 w-4" />
          Search Deals
        </Button>
        <Button variant="outline" onClick={handleClear}>
          Clear Filters
        </Button>
      </div>
    </div>
  );
} 