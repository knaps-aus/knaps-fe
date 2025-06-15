import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Sidebar from "@/components/sidebar";
import ProductSearch from "@/components/product-search";
import ProductDetails from "@/components/product-details";
import AddProduct from "@/components/add-product";
import BulkUpload from "@/components/bulk-upload";
import Analytics from "@/components/analytics";
import { Store, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function ProductManagement() {
  const [selectedProductId, setSelectedProductId] = useState<number | null>(null);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Store className="text-primary text-2xl mr-3" />
              <h1 className="text-xl font-semibold text-gray-900">Electronics Franchise ERP</h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="relative flex-1 max-w-lg">
                <ProductSearch onSelectProduct={setSelectedProductId} />
              </div>
              <Button variant="ghost" size="icon">
                <Bell className="h-5 w-5 text-gray-400" />
              </Button>
              <div className="flex items-center space-x-2">
                <Avatar className="w-8 h-8">
                  <AvatarImage src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=32&h=32" />
                  <AvatarFallback>JM</AvatarFallback>
                </Avatar>
                <span className="text-sm text-gray-700">John Manager</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="flex h-screen pt-16">
        <Sidebar />
        
        {/* Main Content */}
        <main className="flex-1 overflow-hidden">
          <div className="h-full flex flex-col">
            <Tabs defaultValue="product-details" className="h-full flex flex-col">
              <div className="bg-white border-b border-gray-200">
                <TabsList className="grid w-full grid-cols-4 bg-transparent h-auto p-0">
                  <TabsTrigger 
                    value="product-details" 
                    className="border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:text-primary rounded-none py-4 px-1 text-sm font-medium"
                  >
                    Product Details
                  </TabsTrigger>
                  <TabsTrigger 
                    value="add-product"
                    className="border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:text-primary rounded-none py-4 px-1 text-sm font-medium"
                  >
                    Add New Product
                  </TabsTrigger>
                  <TabsTrigger 
                    value="bulk-upload"
                    className="border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:text-primary rounded-none py-4 px-1 text-sm font-medium"
                  >
                    Bulk Upload
                  </TabsTrigger>
                  <TabsTrigger 
                    value="analytics"
                    className="border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:text-primary rounded-none py-4 px-1 text-sm font-medium"
                  >
                    Sales Analytics
                  </TabsTrigger>
                </TabsList>
              </div>

              <div className="flex-1 overflow-auto">
                <TabsContent value="product-details" className="mt-0 h-full">
                  <ProductDetails productId={selectedProductId} />
                </TabsContent>
                <TabsContent value="add-product" className="mt-0 h-full">
                  <AddProduct />
                </TabsContent>
                <TabsContent value="bulk-upload" className="mt-0 h-full">
                  <BulkUpload />
                </TabsContent>
                <TabsContent value="analytics" className="mt-0 h-full">
                  <Analytics />
                </TabsContent>
              </div>
            </Tabs>
          </div>
        </main>
      </div>
    </div>
  );
}
