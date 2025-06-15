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
import { Save, Edit, Camera, ChevronDown, ChevronUp } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Product, ProductAnalytics } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";

interface ProductDetailsProps {
  productId: number | null;
}

export default function ProductDetails({ productId }: ProductDetailsProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [showAllAttributes, setShowAllAttributes] = useState(false);
  const [formData, setFormData] = useState<Product | null>(null);
  const { toast } = useToast();

  const { data: product, isLoading } = useQuery<Product>({
    queryKey: ['/api/products', productId],
    enabled: !!productId,
  });

  const { data: analytics } = useQuery<ProductAnalytics[]>({
    queryKey: ['/api/analytics/products', productId],
    enabled: !!productId,
  });

  const updateMutation = useMutation({
    mutationFn: async (data: Partial<Product>) => {
      if (!productId) throw new Error('No product ID');
      return apiRequest('PUT', `/api/products/${productId}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/products'] });
      queryClient.invalidateQueries({ queryKey: ['/api/products', productId] });
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

  useEffect(() => {
    if (product) {
      setFormData(product);
    }
  }, [product]);

  useEffect(() => {
    if (isEditing) {
      setShowAllAttributes(true);
    }
  }, [isEditing]);

  if (!productId) {
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

  if (!formData) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateMutation.mutate(formData);
  };

  const handleInputChange = (field: keyof Product, value: any) => {
    setFormData(prev => prev ? { ...prev, [field]: value } : null);
  };

  const calculateMargin = (sellPrice: string, tradePrice: string) => {
    const sell = parseFloat(sellPrice || '0');
    const trade = parseFloat(tradePrice || '0');
    if (trade === 0) return { percentage: 0, amount: 0 };
    const amount = sell - trade;
    const percentage = (amount / trade) * 100;
    return { percentage: Math.round(percentage * 10) / 10, amount };
  };

  const rrpMargin = calculateMargin(formData.rrp || '0', formData.trade || '0');
  const mwpMargin = calculateMargin(formData.mwp || '0', formData.trade || '0');
  const goMargin = calculateMargin(formData.go || '0', formData.trade || '0');

  const productAnalytics = analytics?.[0];

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
                    <Input
                      id="brand_name"
                      value={formData.brand_name || ''}
                      onChange={(e) => handleInputChange('brand_name', e.target.value)}
                      disabled={!isEditing}
                    />
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
                    <Select
                      value={formData.distributor_name || ''}
                      onValueChange={(value) => handleInputChange('distributor_name', value)}
                      disabled={!isEditing}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Samsung Electronics">Samsung Electronics</SelectItem>
                        <SelectItem value="Tech Distributors Ltd">Tech Distributors Ltd</SelectItem>
                        <SelectItem value="Electronics Wholesale Co">Electronics Wholesale Co</SelectItem>
                        <SelectItem value="Beko">Beko</SelectItem>
                        <SelectItem value="LG Electronics">LG Electronics</SelectItem>
                      </SelectContent>
                    </Select>
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
                    <Label htmlFor="category_name">Category</Label>
                    <Select
                      value={formData.category_name || ''}
                      onValueChange={(value) => handleInputChange('category_name', value)}
                      disabled={!isEditing}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Television & Audio">Television & Audio</SelectItem>
                        <SelectItem value="Home Appliances">Home Appliances</SelectItem>
                        <SelectItem value="Mobile & Accessories">Mobile & Accessories</SelectItem>
                        <SelectItem value="Computing">Computing</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="shipping_class">Shipping Class</Label>
                    <Select
                      value={formData.shipping_class || ''}
                      onValueChange={(value) => handleInputChange('shipping_class', value)}
                      disabled={!isEditing}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Large Items">Large Items</SelectItem>
                        <SelectItem value="Standard">Standard</SelectItem>
                        <SelectItem value="Express">Express</SelectItem>
                        <SelectItem value="Fragile">Fragile</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="pack_size">Pack Size</Label>
                    <Input
                      id="pack_size"
                      type="number"
                      value={formData.pack_size || 1}
                      onChange={(e) => handleInputChange('pack_size', parseInt(e.target.value))}
                      disabled={!isEditing}
                    />
                  </div>
                  <div>
                    <Label htmlFor="core_group">Core Group</Label>
                    <Input
                      id="core_group"
                      value={formData.core_group || ''}
                      onChange={(e) => handleInputChange('core_group', e.target.value)}
                      disabled={!isEditing}
                    />
                  </div>
                  <div>
                    <Label htmlFor="product_availability">Availability Status</Label>
                    <Select
                      value={formData.product_availability || ''}
                      onValueChange={(value) => handleInputChange('product_availability', value)}
                      disabled={!isEditing}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="In Stock">In Stock</SelectItem>
                        <SelectItem value="Low Stock">Low Stock</SelectItem>
                        <SelectItem value="Out of Stock">Out of Stock</SelectItem>
                        <SelectItem value="Discontinued">Discontinued</SelectItem>
                      </SelectContent>
                    </Select>
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
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div>
                <Label htmlFor="trade">Trade Price</Label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-gray-500">$</span>
                  <Input
                    id="trade"
                    type="number"
                    step="0.01"
                    value={formData.trade || ''}
                    onChange={(e) => handleInputChange('trade', e.target.value)}
                    disabled={!isEditing}
                    className="pl-8"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="rrp">RRP</Label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-gray-500">$</span>
                  <Input
                    id="rrp"
                    type="number"
                    step="0.01"
                    value={formData.rrp || ''}
                    onChange={(e) => handleInputChange('rrp', e.target.value)}
                    disabled={!isEditing}
                    className="pl-8"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="mwp">MWP</Label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-gray-500">$</span>
                  <Input
                    id="mwp"
                    type="number"
                    step="0.01"
                    value={formData.mwp || ''}
                    onChange={(e) => handleInputChange('mwp', e.target.value)}
                    disabled={!isEditing}
                    className="pl-8"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="go">GO Price</Label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-gray-500">$</span>
                  <Input
                    id="go"
                    type="number"
                    step="0.01"
                    value={formData.go || ''}
                    onChange={(e) => handleInputChange('go', e.target.value)}
                    disabled={!isEditing}
                    className="pl-8"
                  />
                </div>
              </div>
            </div>
            
            {/* Margin Calculation Display */}
            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-green-50 p-4 rounded-lg">
                <div className="text-sm text-green-600 font-medium">RRP Margin</div>
                <div className="text-xl font-bold text-green-700">{rrpMargin.percentage}%</div>
                <div className="text-sm text-green-600">${rrpMargin.amount.toFixed(2)}</div>
              </div>
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="text-sm text-blue-600 font-medium">MWP Margin</div>
                <div className="text-xl font-bold text-blue-700">{mwpMargin.percentage}%</div>
                <div className="text-sm text-blue-600">${mwpMargin.amount.toFixed(2)}</div>
              </div>
              <div className="bg-orange-50 p-4 rounded-lg">
                <div className="text-sm text-orange-600 font-medium">GO Margin</div>
                <div className="text-xl font-bold text-orange-700">{goMargin.percentage}%</div>
                <div className="text-sm text-orange-600">${goMargin.amount.toFixed(2)}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Additional Attributes Card - Conditionally Displayed */}
        {(showAllAttributes || isEditing) && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Additional Product Attributes</CardTitle>
            </CardHeader>
            <CardContent>
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
            </CardContent>
          </Card>
        )}

        {/* Product Details Card */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Product Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="category_name">Category</Label>
                <Select
                  value={formData.category_name}
                  onValueChange={(value) => handleInputChange('category_name', value)}
                  disabled={!isEditing}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Television & Audio">Television & Audio</SelectItem>
                    <SelectItem value="Home Appliances">Home Appliances</SelectItem>
                    <SelectItem value="Mobile & Accessories">Mobile & Accessories</SelectItem>
                    <SelectItem value="Computing">Computing</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="shipping_class">Shipping Class</Label>
                <Select
                  value={formData.shipping_class || ''}
                  onValueChange={(value) => handleInputChange('shipping_class', value)}
                  disabled={!isEditing}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Large Items">Large Items</SelectItem>
                    <SelectItem value="Standard">Standard</SelectItem>
                    <SelectItem value="Express">Express</SelectItem>
                    <SelectItem value="Fragile">Fragile</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="pack_size">Pack Size</Label>
                <Input
                  id="pack_size"
                  type="number"
                  value={formData.pack_size}
                  onChange={(e) => handleInputChange('pack_size', parseInt(e.target.value))}
                  disabled={!isEditing}
                />
              </div>
              <div>
                <Label htmlFor="core_group">Core Group</Label>
                <Input
                  id="core_group"
                  value={formData.core_group || ''}
                  onChange={(e) => handleInputChange('core_group', e.target.value)}
                  disabled={!isEditing}
                />
              </div>
              <div>
                <Label htmlFor="product_availability">Availability Status</Label>
                <Select
                  value={formData.product_availability}
                  onValueChange={(value) => handleInputChange('product_availability', value)}
                  disabled={!isEditing}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="In Stock">In Stock</SelectItem>
                    <SelectItem value="Low Stock">Low Stock</SelectItem>
                    <SelectItem value="Out of Stock">Out of Stock</SelectItem>
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
            </div>

            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
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
                <Label htmlFor="hyperlink">Hyperlink</Label>
                <Input
                  id="hyperlink"
                  type="url"
                  value={formData.hyperlink || ''}
                  onChange={(e) => handleInputChange('hyperlink', e.target.value)}
                  disabled={!isEditing}
                />
              </div>
            </div>

            <div className="mt-6">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                rows={3}
                value={formData.description || ''}
                onChange={(e) => handleInputChange('description', e.target.value)}
                disabled={!isEditing}
              />
            </div>

            <div className="mt-6">
              <Label htmlFor="summary">Summary</Label>
              <Textarea
                id="summary"
                rows={2}
                value={formData.summary || ''}
                onChange={(e) => handleInputChange('summary', e.target.value)}
                disabled={!isEditing}
              />
            </div>

            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="features_and_benefits_codes">Features & Benefits Codes</Label>
                <Input
                  id="features_and_benefits_codes"
                  value={formData.features_and_benefits_codes || ''}
                  onChange={(e) => handleInputChange('features_and_benefits_codes', e.target.value)}
                  disabled={!isEditing}
                />
              </div>
              <div>
                <Label htmlFor="badges_codes">Badge Codes</Label>
                <Input
                  id="badges_codes"
                  value={formData.badges_codes || ''}
                  onChange={(e) => handleInputChange('badges_codes', e.target.value)}
                  disabled={!isEditing}
                />
              </div>
            </div>

            {/* Checkboxes */}
            <div className="mt-6 flex flex-wrap gap-6">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="online"
                  checked={formData.online}
                  onCheckedChange={(checked) => handleInputChange('online', checked)}
                  disabled={!isEditing}
                />
                <Label htmlFor="online">Available Online</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="tax_exmt"
                  checked={formData.tax_exmt}
                  onCheckedChange={(checked) => handleInputChange('tax_exmt', checked)}
                  disabled={!isEditing}
                />
                <Label htmlFor="tax_exmt">Tax Exempt</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="stock_unmanaged"
                  checked={formData.stock_unmanaged}
                  onCheckedChange={(checked) => handleInputChange('stock_unmanaged', checked)}
                  disabled={!isEditing}
                />
                <Label htmlFor="stock_unmanaged">Unmanaged Stock</Label>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Sales Performance Card */}
        {productAnalytics && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Sales Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">{productAnalytics.sell_in_quantity}</div>
                  <div className="text-sm text-gray-500">Total Sell-In (This Month)</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">{productAnalytics.sell_through_quantity}</div>
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
