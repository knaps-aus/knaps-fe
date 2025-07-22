import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Save, Edit, Camera, ChevronDown, ChevronUp, Plus, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  ProductWithPrices as Product,
  ProductAnalytics,
  PriceLevel,
} from "@shared/schema";
import MarginCalculator from "@/components/margin-calculator";
import ProductDeals from "@/components/product-deals";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import AsyncSelect from 'react-select/async';
import { SingleValue, StylesConfig } from 'react-select';

interface ProductDetailsProps {
  productCode: string | null;
}

export default function ProductDetails({ productCode }: ProductDetailsProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [showAllAttributes, setShowAllAttributes] = useState(false);
  const [formData, setFormData] = useState<Product | null>(null);
  const [taxRate, setTaxRate] = useState('10');
  const [goCalc, setGoCalc] = useState({ sellPrice: '', costPrice: '' });
  const [latestPrices, setLatestPrices] = useState<PriceLevel[]>([]);
  const [editingPriceLevel, setEditingPriceLevel] = useState<PriceLevel | null>(null);
  const [isAddPriceDialogOpen, setIsAddPriceDialogOpen] = useState(false);
  const [isEditPriceDialogOpen, setIsEditPriceDialogOpen] = useState(false);
  const [newPriceLevel, setNewPriceLevel] = useState({
    price_level: 'Trade' as 'Trade' | 'RRP' | 'GO' | 'MWP',
    type: 'Standard',
    value_excl: '',
    value_incl: '',
    comments: '',
    valid_start: '',
    valid_end: ''
  });
  const { toast } = useToast();
  const [selectedDistributor, setSelectedDistributor] = useState<{ id: number; name: string } | null>(null);
  const [brandOptions, setBrandOptions] = useState<{ value: number; label: string }[]>([]);
  const [isLoadingBrands, setIsLoadingBrands] = useState(false);
  const [ctcHierarchy, setCtcHierarchy] = useState<any[]>([]);
  const [ctcClassOptions, setCtcClassOptions] = useState<{ value: number; label: string; data: any }[]>([]);
  const [ctcTypeOptions, setCtcTypeOptions] = useState<{ value: number; label: string; data: any }[]>([]);
  const [ctcCategoryOptions, setCtcCategoryOptions] = useState<{ value: number; label: string; data: any }[]>([]);
  const [selectedCtcClass, setSelectedCtcClass] = useState<any>(null);
  const [selectedCtcType, setSelectedCtcType] = useState<any>(null);

  const { data: product, isLoading } = useQuery<Product>({
    queryKey: [`/products/${productCode}`],
    enabled: !!productCode,
  });

  const { data: analytics } = useQuery<ProductAnalytics[]>({
    queryKey: [`/analytics/products/${productCode}`],
    enabled: !!productCode,
  });

  const updateMutation = useMutation({
    mutationFn: async (data: Partial<Product>) => {
      if (!product?.id) throw new Error('No product id');
      return apiRequest('PUT', `/products/${product.id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/products'] });
      queryClient.invalidateQueries({ queryKey: [`/products/${productCode}`] });
      setIsEditing(false);
      toast({
        title: "Success",
        description: "Product updated successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update product",
        variant: "destructive",
      });
    },
  });

  const createPriceLevelMutation = useMutation({
    mutationFn: async (data: any) => {
      if (!productCode) throw new Error('No product code');
      return apiRequest('POST', `/products/${productCode}/price-levels`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/products/${productCode}`] });
      setIsAddPriceDialogOpen(false);
      setNewPriceLevel({
        price_level: 'Trade',
        type: 'Standard',
        value_excl: '',
        value_incl: '',
        comments: '',
        valid_start: '',
        valid_end: ''
      });
      toast({
        title: "Success",
        description: "Price level created successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create price level",
        variant: "destructive",
      });
    },
  });

  const updatePriceLevelMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      if (!productCode) throw new Error('No product code');
      return apiRequest('PUT', `/products/${productCode}/price-levels/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/products/${productCode}`] });
      setIsEditPriceDialogOpen(false);
      setEditingPriceLevel(null);
      toast({
        title: "Success",
        description: "Price level updated successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update price level",
        variant: "destructive",
      });
    },
  });

  const deletePriceLevelMutation = useMutation({
    mutationFn: async (id: number) => {
      if (!productCode) throw new Error('No product code');
      return apiRequest('DELETE', `/products/${productCode}/price-levels/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/products/${productCode}`] });
      toast({
        title: "Success",
        description: "Price level deleted successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete price level",
        variant: "destructive",
      });
    },
  });

  // Add this mutation for deleting a product
  const deleteProductMutation = useMutation({
    mutationFn: async () => {
      if (!product?.id) throw new Error('No product id');
      return apiRequest('DELETE', `/products/${product.id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/products'] });
      toast({
        title: 'Deleted',
        description: 'Product deleted successfully',
      });
      // Reload the page after successful deletion
      window.location.reload();
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to delete product',
        variant: 'destructive',
      });
    },
  });

  useEffect(() => {
    if (product) {
      setFormData(product);

      // Set selectedDistributor from product data if available
      if (product.distributor_id && product.distributor_name) {
        setSelectedDistributor({ id: product.distributor_id, name: product.distributor_name });
      } else {
        setSelectedDistributor(null);
      }

      const map: Record<string, PriceLevel> = {};
      product.price_levels?.forEach((pl) => {
        const existing = map[pl.price_level];
        const existingDate = existing
          ? new Date(existing.updated_at ?? existing.created_at ?? '').getTime()
          : -Infinity;
        const newDate = new Date(pl.updated_at ?? pl.created_at ?? '').getTime();
        if (!existing || newDate > existingDate) {
          map[pl.price_level] = pl;
        }
      });
      setLatestPrices(Object.values(map));

      const goPrice = parseFloat(product.my_price?.go ?? '0');
      const rrpPrice = parseFloat(product.my_price?.rrp ?? '0');
      const highestSell = Math.max(goPrice || 0, rrpPrice || 0);

      const invoicePrice = parseFloat(product.my_price?.invoice ?? '0');
      const tradePrice = parseFloat(product.my_price?.trade ?? '0');
      let lowestCost = Math.min(
        invoicePrice || Infinity,
        tradePrice || Infinity
      );
      if (!isFinite(lowestCost)) lowestCost = 0;

      const storeSellPriceGOWithTax = highestSell > 0 ? (highestSell * 1.1).toFixed(2) : '';
      const storeBuyPrice = lowestCost > 0 ? (lowestCost * 1.1).toFixed(2) : '';

      setGoCalc({
        sellPrice: storeSellPriceGOWithTax,
        costPrice: storeBuyPrice
      });

    }
  }, [product]);

  useEffect(() => {
    if (isEditing) {
      setShowAllAttributes(true);
    }
  }, [isEditing]);

  // Fetch CTC hierarchy on mount
  useEffect(() => {
    async function fetchHierarchy() {
      try {
        const res = await apiRequest('GET', '/ctc/hierarchy');
        const data = await res.json();
        setCtcHierarchy(data);
        setCtcClassOptions(Array.isArray(data) ? data.map((c: any) => ({ value: c.id, label: c.name, data: c })) : []);
      } catch {
        setCtcHierarchy([]);
        setCtcClassOptions([]);
      }
    }
    fetchHierarchy();
  }, []);

  // When class changes, update type options and clear type and category
  useEffect(() => {
    if (selectedCtcClass) {
      const types = selectedCtcClass.data.types || [];
      setCtcTypeOptions(types.map((type: any) => ({ value: type.id, label: type.name, data: type })));
      setFormData(prev => prev ? { 
        ...prev, 
        ctc_class_id: selectedCtcClass.value, 
        ctc_class_name: selectedCtcClass.label,
        ctc_type_id: null, 
        ctc_type_name: '', 
        ctc_category_id: null, 
        ctc_category_name: '' 
      } : null);
    } else {
      setCtcTypeOptions([]);
      setFormData(prev => prev ? { 
        ...prev, 
        ctc_class_id: null, 
        ctc_class_name: '', 
        ctc_type_id: null, 
        ctc_type_name: '', 
        ctc_category_id: null, 
        ctc_category_name: '' 
      } : null);
    }
  }, [selectedCtcClass]);

  // When type changes, update category options and clear category
  useEffect(() => {
    if (selectedCtcType) {
      const categories = selectedCtcType.data.categories || [];
      setCtcCategoryOptions(categories.map((cat: any) => ({ value: cat.id, label: cat.name, data: cat })));
      setFormData(prev => prev ? { 
        ...prev, 
        ctc_type_id: selectedCtcType.value, 
        ctc_type_name: selectedCtcType.label, 
        ctc_category_id: null, 
        ctc_category_name: '' 
      } : null);
    } else {
      setCtcCategoryOptions([]);
      setFormData(prev => prev ? { 
        ...prev, 
        ctc_type_id: null, 
        ctc_type_name: '', 
        ctc_category_id: null, 
        ctc_category_name: '' 
      } : null);
    }
  }, [selectedCtcType]);

  // When distributor changes, fetch brands
  useEffect(() => {
    if (selectedDistributor) {
      loadBrandsForDistributor(selectedDistributor.id);
      // Clear brand selection when distributor changes
      setFormData(prev => prev ? { ...prev, brand_id: null, brand_name: '' } : null);
    } else {
      setBrandOptions([]);
      setFormData(prev => prev ? { ...prev, brand_id: null, brand_name: '' } : null);
    }
  }, [selectedDistributor]);

  // Handle conditional rendering in the return statement
  if (!productCode) {
    return (
      <div className="p-6 text-center">
        <p className="text-gray-500">Select a product from the search to view details</p>
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

  if (!formData) {
    return (
      <div className="p-6 text-center">
        <p className="text-gray-500">Loading product details...</p>
      </div>
    );
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateMutation.mutate(formData);
  };

  const handleInputChange = (field: keyof Product, value: any) => {
    setFormData(prev => prev ? { ...prev, [field]: value } : null);
  };

  const handleAddPriceLevel = () => {
    createPriceLevelMutation.mutate(newPriceLevel);
  };

  const handleUpdatePriceLevel = () => {
    if (!editingPriceLevel?.id) return;
    updatePriceLevelMutation.mutate({
      id: editingPriceLevel.id,
      data: {
        value_excl: editingPriceLevel.value_excl,
        value_incl: editingPriceLevel.value_incl,
        comments: editingPriceLevel.comments,
        valid_start: editingPriceLevel.valid_start,
        valid_end: editingPriceLevel.valid_end
      }
    });
  };

  const handleDeletePriceLevel = (id: number) => {
    if (confirm('Are you sure you want to delete this price level?')) {
      deletePriceLevelMutation.mutate(id);
    }
  };

  const handleEditPriceLevel = (priceLevel: PriceLevel) => {
    setEditingPriceLevel(priceLevel);
    setIsEditPriceDialogOpen(true);
  };

  // Helper for distributor search
  const loadDistributorOptions = async (inputValue: string) => {
    if (!inputValue) return [];
    try {
      const res = await apiRequest('GET', `/distributors/search?q=${encodeURIComponent(inputValue)}`);
      if (!Array.isArray(res)) return [];
      return res.map((d: any) => ({ value: d.id, label: d.name, data: d }));
    } catch {
      return [];
    }
  };

  // Helper for brand search (fetch all brands for a distributor)
  const loadBrandsForDistributor = async (distributorId: number) => {
    setIsLoadingBrands(true);
    try {
      const res = await apiRequest('GET', `/brands/distributor/${distributorId}`);
      const brands = await res.json();
      setBrandOptions(Array.isArray(brands) ? brands.map((b: any) => ({ value: b.id, label: b.name, data: b })) : []);
    } catch {
      setBrandOptions([]);
    } finally {
      setIsLoadingBrands(false);
    }
  };

  const productAnalytics = analytics?.[0];

  const selectStyles: StylesConfig<any, false> = {
    container: (base) => ({ ...base, width: '100%' }),
    menu: (base) => ({ ...base, zIndex: 9999 }),
  };

  return (
    <div className="p-6">
      <form onSubmit={handleSubmit}>
        {/* Product Overview Card */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Product Overview</CardTitle>
              <div className="flex items-center space-x-2">
                <Badge variant={formData.status === 'Active' ? 'default' : 'secondary'}>
                  {formData.status}
                </Badge>
                <div className="flex items-center space-x-2">
                  {!isEditing && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowAllAttributes(!showAllAttributes)}
                    >
                      {showAllAttributes ? (
                        <>
                          <ChevronUp className="h-4 w-4 mr-1" />
                          Hide Attributes
                        </>
                      ) : (
                        <>
                          <ChevronDown className="h-4 w-4 mr-1" />
                          Show All Attributes
                        </>
                      )}
                    </Button>
                  )}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setIsEditing(!isEditing)}
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    {isEditing ? 'Cancel' : 'Edit Product'}
                  </Button>
                  {isEditing && (
                    <Button type="submit" size="sm" disabled={updateMutation.isPending}>
                      <Save className="h-4 w-4 mr-2" />
                      {updateMutation.isPending ? 'Saving...' : 'Save'}
                    </Button>
                  )}
                  {!isEditing && (
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      onClick={() => {
                        if (window.confirm('Are you sure you want to delete this product?')) {
                          deleteProductMutation.mutate();
                        }
                      }}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Product Image */}
              <div className="lg:col-span-1">
                <img 
                  src="https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300" 
                  alt="Product" 
                  className="w-full h-48 object-cover rounded-lg border border-gray-200"
                />
                {isEditing && (
                  <Button type="button" variant="ghost" size="sm" className="mt-2 w-full">
                    <Camera className="h-4 w-4 mr-1" />
                    Update Image
                  </Button>
                )}
              </div>
              
              {/* Product Basic Info */}
              <div className="lg:col-span-2">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="product_name">Product Name</Label>
                    <Input
                      id="product_name"
                      value={formData.product_name || ''}
                      onChange={(e) => handleInputChange('product_name', e.target.value)}
                      disabled={!isEditing}
                    />
                  </div>
                  <div>
                    <Label htmlFor="product_code">Product Code</Label>
                    <Input
                      id="product_code"
                      value={formData.product_code || ''}
                      onChange={(e) => handleInputChange('product_code', e.target.value)}
                      disabled={!isEditing}
                    />
                  </div>
                  <div>
                    <Label htmlFor="brand_name">Brand Name</Label>
                                          {isEditing ? (
                        <Select
                          value={formData.brand_id?.toString() || ''}
                          onValueChange={(value) => {
                            const brand = brandOptions.find(b => b.value.toString() === value);
                            if (brand) {
                              setFormData(prev => prev ? { ...prev, brand_id: brand.value, brand_name: brand.label } : null);
                            } else {
                              setFormData(prev => prev ? { ...prev, brand_id: null, brand_name: '' } : null);
                            }
                          }}
                          disabled={!selectedDistributor || isLoadingBrands}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder={selectedDistributor ? (isLoadingBrands ? 'Loading brands...' : 'Select brand') : 'Select distributor first'} />
                          </SelectTrigger>
                          <SelectContent>
                            {brandOptions.map((brand) => (
                              <SelectItem key={brand.value} value={brand.value.toString()}>
                                {brand.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                    ) : (
                      <Input
                        id="brand_name"
                        value={formData.brand_name || ''}
                        disabled
                      />
                    )}
                  </div>
                  <div>
                    <Label htmlFor="product_secondary_code">Secondary Code</Label>
                    <Input
                      id="product_secondary_code"
                      value={formData.product_secondary_code || ''}
                      onChange={(e) => handleInputChange('product_secondary_code', e.target.value)}
                      disabled={!isEditing}
                    />
                  </div>
                  <div>
                    <Label htmlFor="distributor_name">Distributor</Label>
                    {isEditing ? (
                      <AsyncSelect
                        cacheOptions
                        defaultOptions
                        loadOptions={loadDistributorOptions}
                        value={selectedDistributor ? { value: selectedDistributor.id, label: selectedDistributor.name } : null}
                        onChange={(option: SingleValue<{ value: number; label: string; data: any }>) => {
                          if (option) {
                            setSelectedDistributor({ id: option.value, name: option.label });
                            setFormData(prev => prev ? { ...prev, distributor_id: option.value, distributor_name: option.label } : null);
                          } else {
                            setSelectedDistributor(null);
                            setFormData(prev => prev ? { ...prev, distributor_id: null, distributor_name: '' } : null);
                          }
                        }}
                        isClearable
                        placeholder="Search distributor..."
                        styles={selectStyles}
                      />
                    ) : (
                      <Input
                        id="distributor_name"
                        value={formData.distributor_name || ''}
                        disabled
                      />
                    )}
                  </div>
                  <div>
                    <Label htmlFor="ean">EAN</Label>
                    <Input
                      id="ean"
                      value={formData.ean || ''}
                      onChange={(e) => handleInputChange('ean', e.target.value)}
                      disabled={!isEditing}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Additional Attributes - Conditionally Displayed */}
            {(showAllAttributes || isEditing) && (
              <div className="mt-8 pt-6 border-t border-gray-200">
                <h4 className="text-md font-medium text-gray-900 mb-4">Additional Product Attributes</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="status">Product Status</Label>
                    <Select
                      value={formData.status || ''}
                      onValueChange={(value) => handleInputChange('status', value)}
                      disabled={!isEditing}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Active">Active</SelectItem>
                        <SelectItem value="Inactive">Inactive</SelectItem>
                        <SelectItem value="Discontinued">Discontinued</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="superceded_by">Superseded By</Label>
                    <Input
                      id="superceded_by"
                      value={formData.superceded_by || ''}
                      onChange={(e) => handleInputChange('superceded_by', e.target.value)}
                      disabled={!isEditing}
                      placeholder="Enter product code if applicable"
                    />
                  </div>
                  <div>
                    <Label htmlFor="web_title">Web Title</Label>
                    <Input
                      id="web_title"
                      value={formData.web_title || ''}
                      onChange={(e) => handleInputChange('web_title', e.target.value)}
                      disabled={!isEditing}
                    />
                  </div>
                  <div>
                    <Label htmlFor="hyperlink">Product Link</Label>
                    <Input
                      id="hyperlink"
                      type="url"
                      value={formData.hyperlink || ''}
                      onChange={(e) => handleInputChange('hyperlink', e.target.value)}
                      disabled={!isEditing}
                      placeholder="https://..."
                    />
                  </div>
                  <div>
                    <Label htmlFor="features_and_benefits_codes">Features & Benefits</Label>
                    <Input
                      id="features_and_benefits_codes"
                      value={formData.features_and_benefits_codes || ''}
                      onChange={(e) => handleInputChange('features_and_benefits_codes', e.target.value)}
                      disabled={!isEditing}
                      placeholder="Comma-separated codes"
                    />
                  </div>
                  <div>
                    <Label htmlFor="badges_codes">Badge Codes</Label>
                    <Input
                      id="badges_codes"
                      value={formData.badges_codes || ''}
                      onChange={(e) => handleInputChange('badges_codes', e.target.value)}
                      disabled={!isEditing}
                      placeholder="Comma-separated codes"
                    />
                  </div>
                  <div>
                    <Label htmlFor="ctc_class">CTC Class</Label>
                    {isEditing ? (
                      <AsyncSelect
                        cacheOptions={false}
                        defaultOptions={ctcClassOptions}
                        options={ctcClassOptions}
                        value={ctcClassOptions.find(c => c.value === formData.ctc_class_id) || null}
                        onChange={(option) => setSelectedCtcClass(option)}
                        isClearable
                        placeholder="Select class"
                        styles={selectStyles}
                      />
                    ) : (
                      <Input
                        id="ctc_class"
                        value={formData.ctc_class_name || ''}
                        disabled
                      />
                    )}
                  </div>
                  <div>
                    <Label htmlFor="ctc_type">CTC Type</Label>
                    {isEditing ? (
                      <AsyncSelect
                        cacheOptions={false}
                        defaultOptions={ctcTypeOptions}
                        options={ctcTypeOptions}
                        value={ctcTypeOptions.find(t => t.value === formData.ctc_type_id) || null}
                        onChange={(option) => setSelectedCtcType(option)}
                        isClearable
                        isDisabled={!selectedCtcClass}
                        placeholder={selectedCtcClass ? 'Select type' : 'Select class first'}
                        styles={selectStyles}
                      />
                    ) : (
                      <Input
                        id="ctc_type"
                        value={formData.ctc_type_name || ''}
                        disabled
                      />
                    )}
                  </div>
                  <div>
                    <Label htmlFor="ctc_category">CTC Category</Label>
                    {isEditing ? (
                      <AsyncSelect
                        cacheOptions={false}
                        defaultOptions={ctcCategoryOptions}
                        options={ctcCategoryOptions}
                        value={ctcCategoryOptions.find(cat => cat.value === formData.ctc_category_id) || null}
                        onChange={(option) => setFormData(prev => prev ? { ...prev, ctc_category_id: option ? option.value : null, ctc_category_name: option ? option.label : '' } : null)}
                        isClearable
                        isDisabled={!selectedCtcType}
                        placeholder={selectedCtcType ? 'Select category' : 'Select type first'}
                        styles={selectStyles}
                      />
                    ) : (
                      <Input
                        id="ctc_category"
                        value={formData.ctc_category_name || ''}
                        disabled
                      />
                    )}
                  </div>
                </div>

                <div className="mt-6">
                  <Label htmlFor="description">Product Description</Label>
                  <Textarea
                    id="description"
                    rows={3}
                    value={formData.description || ''}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    disabled={!isEditing}
                    placeholder="Detailed product description..."
                  />
                </div>

                <div className="mt-6">
                  <Label htmlFor="summary">Product Summary</Label>
                  <Textarea
                    id="summary"
                    rows={2}
                    value={formData.summary || ''}
                    onChange={(e) => handleInputChange('summary', e.target.value)}
                    disabled={!isEditing}
                    placeholder="Brief product summary..."
                  />
                </div>

                {/* Boolean Flags */}
                <div className="mt-6">
                  <h4 className="text-sm font-medium text-gray-900 mb-4">Product Settings</h4>
                  <div className="flex flex-wrap gap-6">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="online"
                        checked={formData.online || false}
                        onCheckedChange={(checked) => handleInputChange('online', checked)}
                        disabled={!isEditing}
                      />
                      <Label htmlFor="online">Available Online</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="tax_exmt"
                        checked={formData.tax_exmt || false}
                        onCheckedChange={(checked) => handleInputChange('tax_exmt', checked)}
                        disabled={!isEditing}
                      />
                      <Label htmlFor="tax_exmt">Tax Exempt</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="stock_unmanaged"
                        checked={formData.stock_unmanaged || false}
                        onCheckedChange={(checked) => handleInputChange('stock_unmanaged', checked)}
                        disabled={!isEditing}
                      />
                      <Label htmlFor="stock_unmanaged">Unmanaged Stock</Label>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Pricing & Margin Card */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Pricing & Margins</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-center mb-4">
              <h4 className="text-sm font-medium text-gray-900">Price Levels</h4>
              <Dialog open={isAddPriceDialogOpen} onOpenChange={setIsAddPriceDialogOpen}>
                <DialogTrigger asChild>
                  <Button type="button" size="sm" className="flex items-center gap-2">
                    <Plus className="h-4 w-4" />
                    Add Price Level
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add New Price Level</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="price_level">Price Level</Label>
                      <Select
                        value={newPriceLevel.price_level}
                        onValueChange={(value: 'Trade' | 'RRP' | 'GO' | 'MWP') => 
                          setNewPriceLevel(prev => ({ ...prev, price_level: value }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Trade">Trade</SelectItem>
                          <SelectItem value="RRP">RRP</SelectItem>
                          <SelectItem value="GO">GO</SelectItem>
                          <SelectItem value="MWP">MWP</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="type">Type</Label>
                      <Select
                        value={newPriceLevel.type}
                        onValueChange={(value) => 
                          setNewPriceLevel(prev => ({ ...prev, type: value }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Standard">Standard</SelectItem>
                          <SelectItem value="Promotional">Promotional</SelectItem>
                          <SelectItem value="Bulk">Bulk</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="value_excl">Value (Excl. Tax)</Label>
                      <Input
                        id="value_excl"
                        type="number"
                        step="0.01"
                        value={newPriceLevel.value_excl}
                        onChange={(e) => setNewPriceLevel(prev => ({ ...prev, value_excl: e.target.value }))}
                        placeholder="0.00"
                      />
                    </div>
                    <div>
                      <Label htmlFor="value_incl">Value (Incl. Tax)</Label>
                      <Input
                        id="value_incl"
                        type="number"
                        step="0.01"
                        value={newPriceLevel.value_incl}
                        onChange={(e) => setNewPriceLevel(prev => ({ ...prev, value_incl: e.target.value }))}
                        placeholder="0.00"
                      />
                    </div>
                    <div>
                      <Label htmlFor="comments">Comments</Label>
                      <Textarea
                        id="comments"
                        value={newPriceLevel.comments}
                        onChange={(e) => setNewPriceLevel(prev => ({ ...prev, comments: e.target.value }))}
                        placeholder="Optional comments..."
                      />
                    </div>
                    <div>
                      <Label htmlFor="valid_start">Start Date</Label>
                      <Input
                        id="valid_start"
                        type="datetime-local"
                        value={newPriceLevel.valid_start}
                        onChange={(e) => setNewPriceLevel(prev => ({ ...prev, valid_start: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="valid_end">End Date</Label>
                      <Input
                        id="valid_end"
                        type="datetime-local"
                        value={newPriceLevel.valid_end}
                        onChange={(e) => setNewPriceLevel(prev => ({ ...prev, valid_end: e.target.value }))}
                      />
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setIsAddPriceDialogOpen(false)}
                      >
                        Cancel
                      </Button>
                      <Button
                        type="button"
                        onClick={handleAddPriceLevel}
                        disabled={createPriceLevelMutation.isPending}
                      >
                        {createPriceLevelMutation.isPending ? 'Creating...' : 'Create'}
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
            {latestPrices.length > 0 && (
              <div className="overflow-x-auto mb-6">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">Status</TableHead>
                      <TableHead>PriceLevel</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>ValueExcl</TableHead>
                      <TableHead>ValueIncl</TableHead>
                      <TableHead>Comments</TableHead>
                      <TableHead>Start Date</TableHead>
                      <TableHead>End Date</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {latestPrices.map((pl) => {
                      const nameMap: Record<string, string> = {
                        Trade: 'TradePrice',
                        GO: 'GOPrice',
                        MWP: 'MWP',
                        RRP: 'RRP',
                      };

                      const formatValue = (v?: string | null) =>
                        v ? Number(v).toFixed(2) : '-';

                      const formatDate = (d?: string | null) =>
                        d ? new Date(d).toLocaleDateString() : '-';

                      const type = pl.type?.toLowerCase();

                      // Check if price level is currently active
                      const isActive = () => {
                        const now = new Date();
                        const createdDate = pl.created_at ? new Date(pl.created_at) : null;
                        
                        if (!createdDate) return false;
                        if (now < createdDate) return false;
                        
                        return true;
                      };

                                              return (
                          <TableRow key={`${pl.price_level}-${pl.type}`}>
                            <TableCell className="w-12">
                              <div className="flex items-center justify-center">
                                <div
                                  className={`w-2.5 h-2.5 rounded-full ${
                                    isActive() ? 'bg-green-500' : 'bg-red-500'
                                  }`}
                                  title={isActive() ? 'Active' : 'Inactive'}
                                />
                              </div>
                            </TableCell>
                            <TableCell>{nameMap[pl.price_level] || pl.price_level}</TableCell>
                          <TableCell>
                            <Button
                              type="button"
                              variant="secondary"
                              size="sm"
                              className={
                                type === 'buy'
                                  ? 'bg-green-100 text-green-800 hover:bg-green-200'
                                  : type === 'sell'
                                  ? 'bg-red-100 text-red-800 hover:bg-red-200'
                                  : undefined
                              }
                            >
                              {pl.type}
                            </Button>
                          </TableCell>
                          <TableCell>{formatValue(pl.value_excl)}</TableCell>
                          <TableCell>{formatValue(pl.value_incl)}</TableCell>
                          <TableCell>{pl.comments ?? ''}</TableCell>
                          <TableCell>{formatDate(pl.valid_start)}</TableCell>
                          <TableCell>{formatDate(pl.valid_end)}</TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEditPriceLevel(pl)}
                                disabled={!pl.id}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeletePriceLevel(pl.id!)}
                                disabled={!pl.id}
                                className="text-red-600 hover:text-red-700"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            )}

            {/* Edit Price Level Dialog */}
            <Dialog open={isEditPriceDialogOpen} onOpenChange={setIsEditPriceDialogOpen}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Edit Price Level</DialogTitle>
                </DialogHeader>
                {editingPriceLevel && (
                  <div className="space-y-4">
                    <div>
                      <Label>Price Level</Label>
                      <Input
                        value={editingPriceLevel.price_level}
                        disabled
                        className="bg-gray-50"
                      />
                    </div>
                    <div>
                      <Label>Type</Label>
                      <Input
                        value={editingPriceLevel.type}
                        disabled
                        className="bg-gray-50"
                      />
                    </div>
                    <div>
                      <Label htmlFor="edit_value_excl">Value (Excl. Tax)</Label>
                      <Input
                        id="edit_value_excl"
                        type="number"
                        step="0.01"
                        value={editingPriceLevel.value_excl}
                        onChange={(e) => setEditingPriceLevel(prev => 
                          prev ? { ...prev, value_excl: e.target.value } : null
                        )}
                        placeholder="0.00"
                      />
                    </div>
                    <div>
                      <Label htmlFor="edit_value_incl">Value (Incl. Tax)</Label>
                      <Input
                        id="edit_value_incl"
                        type="number"
                        step="0.01"
                        value={editingPriceLevel.value_incl || ''}
                        onChange={(e) => setEditingPriceLevel(prev => 
                          prev ? { ...prev, value_incl: e.target.value } : null
                        )}
                        placeholder="0.00"
                      />
                    </div>
                    <div>
                      <Label htmlFor="edit_comments">Comments</Label>
                      <Textarea
                        id="edit_comments"
                        value={editingPriceLevel.comments || ''}
                        onChange={(e) => setEditingPriceLevel(prev => 
                          prev ? { ...prev, comments: e.target.value } : null
                        )}
                        placeholder="Optional comments..."
                      />
                    </div>
                    <div>
                      <Label htmlFor="edit_valid_start">Start Date</Label>
                      <Input
                        id="edit_valid_start"
                        type="datetime-local"
                        value={editingPriceLevel.valid_start ? new Date(editingPriceLevel.valid_start).toISOString().slice(0, 16) : ''}
                        onChange={(e) => setEditingPriceLevel(prev => 
                          prev ? { ...prev, valid_start: e.target.value ? e.target.value : null } : null
                        )}
                      />
                    </div>
                    <div>
                      <Label htmlFor="edit_valid_end">End Date</Label>
                      <Input
                        id="edit_valid_end"
                        type="datetime-local"
                        value={editingPriceLevel.valid_end ? new Date(editingPriceLevel.valid_end).toISOString().slice(0, 16) : ''}
                        onChange={(e) => setEditingPriceLevel(prev => 
                          prev ? { ...prev, valid_end: e.target.value ? e.target.value : null } : null
                        )}
                      />
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setIsEditPriceDialogOpen(false);
                          setEditingPriceLevel(null);
                        }}
                      >
                        Cancel
                      </Button>
                      <Button
                        type="button"
                        onClick={handleUpdatePriceLevel}
                        disabled={updatePriceLevelMutation.isPending}
                      >
                        {updatePriceLevelMutation.isPending ? 'Updating...' : 'Update'}
                      </Button>
                    </div>
                  </div>
                )}
              </DialogContent>
            </Dialog>

            {/* Pricing Tables */}
            <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Head Office Pricing Table */}
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
                <h4 className="text-lg font-semibold text-purple-900 mb-4">Head Office Pricing</h4>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Price Type</TableHead>
                        <TableHead>Value (Excl. Tax)</TableHead>
                        <TableHead>Value (Incl. Tax)</TableHead>
                        <TableHead>Source</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow>
                        <TableCell className="font-medium">Purchase Price</TableCell>
                        <TableCell>
                          {product?.my_price?.invoice_hoff ? 
                            `$${parseFloat(product.my_price.invoice_hoff).toFixed(2)}` : 
                            '-'
                          }
                        </TableCell>
                        <TableCell>
                          {product?.my_price?.invoice_hoff ? 
                            `$${(parseFloat(product.my_price.invoice_hoff) * 1.1).toFixed(2)}` : 
                            '-'
                          }
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">invoice_hoff</Badge>
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">Sell Price</TableCell>
                        <TableCell>
                          {product?.my_price?.rrp ? 
                            `$${(parseFloat(product.my_price.rrp.toString()) / 1.1).toFixed(2)}` : 
                            '-'
                          }
                        </TableCell>
                        <TableCell>
                          {product?.my_price?.rrp ? 
                            `$${parseFloat(product.my_price.rrp.toString()).toFixed(2)}` : 
                            '-'
                          }
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">RRP</Badge>
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
              </div>

              {/* Store Pricing Table */}
              <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-6">
                <h4 className="text-lg font-semibold text-indigo-900 mb-4">Store Pricing</h4>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Price Type</TableHead>
                        <TableHead>Value (Excl. Tax)</TableHead>
                        <TableHead>Value (Incl. Tax)</TableHead>
                        <TableHead>Source</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow>
                        <TableCell className="font-medium">Buy Price</TableCell>
                        <TableCell>
                          {product?.my_price?.trade ? 
                            `$${parseFloat(product.my_price.trade.toString()).toFixed(2)}` : 
                            '-'
                          }
                        </TableCell>
                        <TableCell>
                          {product?.my_price?.trade ? 
                            `$${(parseFloat(product.my_price.trade.toString()) * 1.1).toFixed(2)}` : 
                            '-'
                          }
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">Trade</Badge>
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">Sell Price (MWP)</TableCell>
                        <TableCell>
                          {product?.my_price?.go || product?.my_price?.trade || product?.my_price?.invoice ? 
                            `$${parseFloat(product.my_price.go || product.my_price.trade || product.my_price.invoice || '0').toFixed(2)}` : 
                            '-'
                          }
                        </TableCell>
                        <TableCell>
                          {product?.my_price?.go || product?.my_price?.trade || product?.my_price?.invoice ? 
                            `$${(parseFloat(product.my_price.go || product.my_price.trade || product.my_price.invoice || '0') * 1.1).toFixed(2)}` : 
                            '-'
                          }
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">
                            {product?.my_price?.go ? 'GO' : product?.my_price?.trade ? 'Trade' : 'Invoice'}
                          </Badge>
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">Sell Price (GO)</TableCell>
                        <TableCell>
                          {product?.my_price?.rrp || product?.my_price?.go || product?.my_price?.trade ? 
                            `$${parseFloat(product.my_price.rrp || product.my_price.go || product.my_price.trade || '0').toFixed(2)}` : 
                            '-'
                          }
                        </TableCell>
                        <TableCell>
                          {product?.my_price?.rrp || product?.my_price?.go || product?.my_price?.trade ? 
                            `$${(parseFloat(product.my_price.rrp || product.my_price.go || product.my_price.trade || '0') * 1.1).toFixed(2)}` : 
                            '-'
                          }
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">
                            {product?.my_price?.rrp ? 'RRP' : product?.my_price?.go ? 'GO' : 'Trade'}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
              </div>
            </div>

            
            {/* Enhanced Margin Calculator */}
            <div className="mt-8">
              {/* Margin Calculator */}
              <div className="flex justify-center">
                <div className="w-full max-w-4xl">
                  <MarginCalculator
                    title="Margin Calculator"
                    sellPrice={goCalc.sellPrice}
                    costPrice={goCalc.costPrice}
                    onSellPriceChange={(value) => setGoCalc(prev => ({ ...prev, sellPrice: value }))}
                    onCostPriceChange={(value) => setGoCalc(prev => ({ ...prev, costPrice: value }))}
                    taxRate={taxRate}
                    className="bg-orange-50 border-orange-200"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Product Deals Card */}
        <ProductDeals product={product} />

        {/* Sales Performance Card */}
        {productAnalytics && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Sales Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">{productAnalytics.turnover_rate}%</div>
                  <div className="text-sm text-gray-500">Total Sell-In (This Month)</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">${productAnalytics.total_revenue}</div>
                  <div className="text-sm text-gray-500">Total Sell-Through (This Month)</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-success">{productAnalytics.turnover_rate}%</div>
                  <div className="text-sm text-gray-500">Turnover Rate</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">{productAnalytics.current_stock}</div>
                  <div className="text-sm text-gray-500">Current Stock</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Save Changes Button */}
        {isEditing && (
          <div className="flex justify-end">
            <Button type="submit" disabled={updateMutation.isPending}>
              <Save className="h-4 w-4 mr-2" />
              {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        )}
      </form>
    </div>
  );
}
