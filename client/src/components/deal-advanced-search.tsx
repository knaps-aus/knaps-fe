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

// CTC Hierarchy interfaces
interface CTCCategory {
  id: number;
  uuid: string;
  code: string;
  name: string;
  active: boolean;
  product_id?: number | null;
}

interface CTCType {
  id: number;
  uuid: string;
  code: string;
  name: string;
  active: boolean;
  categories: CTCCategory[];
}

interface CTCClass {
  id: number;
  uuid: string;
  code: string;
  name: string;
  active: boolean;
  types: CTCType[];
}

interface DealSource {
  id: number;
  uuid: string;
  code: string;
  name: string;
  active: boolean;
}

interface DealAdvancedSearchProps {
  onSearch: (filters: {
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
  }) => void;
  onToggleMode: () => void;
}

export default function DealAdvancedSearch({ onSearch, onToggleMode }: DealAdvancedSearchProps) {
  const [dealTypeId, setDealTypeId] = useState<string>("");
  const [dealStatus, setDealStatus] = useState<string>("");
  const [agreementType, setAgreementType] = useState<string>("");
  const [providerCode, setProviderCode] = useState<string>("");
  const [store, setStore] = useState<string>("");
  const [validOnDate, setValidOnDate] = useState<string>("");
  const [activeOnly, setActiveOnly] = useState<boolean>(true);
  
  // Distributor and Brand search
  const [distributorQuery, setDistributorQuery] = useState("");
  const [brandQuery, setBrandQuery] = useState("");
  const [showDistributorResults, setShowDistributorResults] = useState(false);
  const [showBrandResults, setShowBrandResults] = useState(false);
  const [selectedDistributor, setSelectedDistributor] = useState<Distributor | null>(null);
  const [selectedBrand, setSelectedBrand] = useState<Brand | null>(null);
  
  // CTC Hierarchy state
  const [selectedCtcClass, setSelectedCtcClass] = useState<string>("");
  const [selectedCtcType, setSelectedCtcType] = useState<string>("");
  const [selectedCtcCategory, setSelectedCtcCategory] = useState<string>("");

  // Fetch deal types
  const { data: dealTypes = [] } = useQuery<DealType[]>({
    queryKey: ["/rebates/deal-types"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/rebates/deal-types");
      return response.json();
    },
  });

  // Fetch deal sources
  const { data: dealSources = [] } = useQuery<DealSource[]>({
    queryKey: ["/rebates/deal-sources"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/rebates/deal-sources");
      return response.json();
    },
  });

  // Fetch CTC hierarchy
  const { data: ctcHierarchy = [] } = useQuery<CTCClass[]>({
    queryKey: ["/ctc/hierarchy"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/ctc/hierarchy");
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

  // Reset child selections when parent changes
  useEffect(() => {
    if (!selectedCtcClass) {
      setSelectedCtcType("");
      setSelectedCtcCategory("");
    }
  }, [selectedCtcClass]);

  useEffect(() => {
    if (!selectedCtcType) {
      setSelectedCtcCategory("");
    }
  }, [selectedCtcType]);

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
    const filters: any = {};
    
    if (dealTypeId) filters.deal_type_id = parseInt(dealTypeId);
    if (dealStatus) filters.status = dealStatus;
    if (agreementType) filters.agreement_type = agreementType;
    if (providerCode) filters.provider_code = providerCode;
    if (store) filters.store = store;
    if (validOnDate) filters.valid_on_date = validOnDate;
    if (activeOnly !== undefined) filters.active_only = activeOnly;
    
    if (selectedDistributor) filters.distributor_id = selectedDistributor.id;
    if (selectedBrand) filters.brand_id = selectedBrand.id;
    
    if (selectedCtcClass) filters.product_class_id = parseInt(selectedCtcClass);
    if (selectedCtcType) filters.product_type_id = parseInt(selectedCtcType);
    if (selectedCtcCategory) filters.product_category_id = parseInt(selectedCtcCategory);

    onSearch(filters);
  };

  const handleClear = () => {
    setDealTypeId("");
    setDealStatus("");
    setAgreementType("");
    setProviderCode("");
    setStore("");
    setValidOnDate("");
    setActiveOnly(true);
    setDistributorQuery("");
    setBrandQuery("");
    setSelectedDistributor(null);
    setSelectedBrand(null);
    setSelectedCtcClass("");
    setSelectedCtcType("");
    setSelectedCtcCategory("");
    onSearch({});
  };

  // Get available types and categories based on selections
  const selectedClass = ctcHierarchy.find(cls => cls.id.toString() === selectedCtcClass);
  const availableTypes = selectedClass?.types || [];
  
  const selectedType = availableTypes.find(type => type.id.toString() === selectedCtcType);
  const availableCategories = selectedType?.categories || [];

  return (
    <div className="w-full max-w-6xl mx-auto space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-900">Advanced Deal Search</h3>
        <Button variant="outline" size="sm" onClick={onToggleMode}>
          <X className="h-4 w-4 mr-2" />
          Simple Search
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Deal Type Dropdown */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Deal Type
          </label>
          <Select value={dealTypeId} onValueChange={setDealTypeId}>
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
              <SelectItem value="draft">Draft</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Agreement Type Dropdown */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Agreement Type
          </label>
          <Select value={agreementType} onValueChange={setAgreementType}>
            <SelectTrigger>
              <SelectValue placeholder="Select agreement type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="vendor">Vendor</SelectItem>
              <SelectItem value="distributor">Distributor</SelectItem>
              <SelectItem value="retail">Retail</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Provider Code Dropdown */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Provider Code
          </label>
          <Select value={providerCode} onValueChange={setProviderCode}>
            <SelectTrigger>
              <SelectValue placeholder="Select provider" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="dist">Distributor</SelectItem>
              <SelectItem value="hoff">Head Office</SelectItem>
              <SelectItem value="nart">Narta</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Store Input */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Store
          </label>
          <Input
            type="text"
            placeholder="e.g., QHOF"
            value={store}
            onChange={(e) => setStore(e.target.value)}
          />
        </div>

        {/* Valid On Date */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Valid On Date
          </label>
          <Input
            type="date"
            value={validOnDate}
            onChange={(e) => setValidOnDate(e.target.value)}
          />
        </div>

        {/* CTC Class Dropdown */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            CTC Class
          </label>
          <Select value={selectedCtcClass} onValueChange={setSelectedCtcClass}>
            <SelectTrigger>
              <SelectValue placeholder="Select class" />
            </SelectTrigger>
            <SelectContent>
              {ctcHierarchy.map((cls) => (
                <SelectItem key={cls.id} value={cls.id.toString()}>
                  {cls.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* CTC Type Dropdown */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            CTC Type
          </label>
          <Select 
            value={selectedCtcType} 
            onValueChange={setSelectedCtcType}
            disabled={!selectedCtcClass}
          >
            <SelectTrigger className={!selectedCtcClass ? "opacity-50 cursor-not-allowed" : ""}>
              <SelectValue placeholder={selectedCtcClass ? "Select type" : "Select class first"} />
            </SelectTrigger>
            <SelectContent>
              {availableTypes.map((type) => (
                <SelectItem key={type.id} value={type.id.toString()}>
                  {type.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* CTC Category Dropdown */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            CTC Category
          </label>
          <Select 
            value={selectedCtcCategory} 
            onValueChange={setSelectedCtcCategory}
            disabled={!selectedCtcType}
          >
            <SelectTrigger className={!selectedCtcType ? "opacity-50 cursor-not-allowed" : ""}>
              <SelectValue placeholder={selectedCtcType ? "Select category" : "Select type first"} />
            </SelectTrigger>
            <SelectContent>
              {availableCategories.map((category) => (
                <SelectItem key={category.id} value={category.id.toString()}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Active Only Toggle */}
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="activeOnly"
            checked={activeOnly}
            onChange={(e) => setActiveOnly(e.target.checked)}
            className="rounded border-gray-300"
          />
          <label htmlFor="activeOnly" className="text-sm font-medium text-gray-700">
            Active Only
          </label>
        </div>
      </div>

      {/* Distributor and Brand Search - Full Width */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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