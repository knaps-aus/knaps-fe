import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Sidebar from "@/components/sidebar";
import ProductSearch from "@/components/product-search";
import ProductDetails from "@/components/product-details";
import AddProduct from "@/components/add-product";
import BulkUpload from "@/components/bulk-upload";
import AddDeal from "@/components/add-deal";
import BulkDealUpload from "@/components/bulk-deal-upload";
import DealList from "@/components/deal-list";
import Analytics from "@/components/analytics";
import { Store, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import UserMenu from "@/components/user-menu";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from "@/components/ui/dialog";

export default function ProductManagement() {
  const [selectedProductCode, setSelectedProductCode] = useState<string | null>(null);
  const [addOpen, setAddOpen] = useState(false);
  const [bulkOpen, setBulkOpen] = useState(false);
  const [selectedDealProductId, setSelectedDealProductId] = useState<number | null>(null);
  const [addDealOpen, setAddDealOpen] = useState(false);
  const [bulkDealOpen, setBulkDealOpen] = useState(false);

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
        
        {/* Main Content */}
        <main className="flex-1 overflow-hidden">
          <div className="h-full flex flex-col">
            <Tabs defaultValue="products" className="h-full flex flex-col">
              <div className="bg-white border-b border-gray-200">
                <TabsList className="grid w-full grid-cols-3 bg-transparent h-auto p-0">
                  <TabsTrigger
                    value="products"
                    className="border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:text-primary rounded-none py-4 px-1 text-sm font-medium"
                  >
                    Products
                  </TabsTrigger>
                  <TabsTrigger
                    value="deals"
                    className="border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:text-primary rounded-none py-4 px-1 text-sm font-medium"
                  >
                    Deals
                  </TabsTrigger>
                  <TabsTrigger
                    value="analytics"
                    className="border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:text-primary rounded-none py-4 px-1 text-sm font-medium"
                  >
                    Analytics
                  </TabsTrigger>
                </TabsList>
              </div>

              <div className="flex-1 overflow-auto">
                <TabsContent value="products" className="mt-0 h-full">
                  <div className="flex flex-col items-center p-6">
                    <div className="w-full max-w-lg mx-auto">
                      <ProductSearch onSelectProduct={setSelectedProductCode} />
                    </div>
                    <div className="mt-4 flex gap-4">
                      <Dialog open={addOpen} onOpenChange={setAddOpen}>
                        <DialogTrigger asChild>
                          <Button>Add Product</Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                          <AddProduct />
                        </DialogContent>
                      </Dialog>
                      <Dialog open={bulkOpen} onOpenChange={setBulkOpen}>
                        <DialogTrigger asChild>
                          <Button variant="secondary">Bulk Upload</Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                          <BulkUpload />
                        </DialogContent>
                      </Dialog>
                    </div>
                    <div className="mt-6 w-full">
                      <ProductDetails productCode={selectedProductCode} />
                    </div>
                  </div>
                </TabsContent>
                <TabsContent value="deals" className="mt-0 h-full">
                  <div className="flex flex-col items-center p-6">
                    <div className="w-full max-w-lg mx-auto">
                      <ProductSearch onSelectProduct={setSelectedDealProductId} />
                    </div>
                    <div className="mt-4 flex gap-4">
                      <Dialog open={addDealOpen} onOpenChange={setAddDealOpen}>
                        <DialogTrigger asChild>
                          <Button>Add Deal</Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                          <AddDeal />
                        </DialogContent>
                      </Dialog>
                      <Dialog open={bulkDealOpen} onOpenChange={setBulkDealOpen}>
                        <DialogTrigger asChild>
                          <Button variant="secondary">Bulk Upload</Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                          <BulkDealUpload />
                        </DialogContent>
                      </Dialog>
                    </div>
                    <div className="mt-6 w-full">
                      <DealList productId={selectedDealProductId} />
                    </div>
                  </div>
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
