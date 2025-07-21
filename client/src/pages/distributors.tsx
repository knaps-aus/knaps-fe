import Sidebar from "@/components/sidebar";
import DistributorList from "@/components/distributor-list";
import UserMenu from "@/components/user-menu";
import { Store, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function DistributorsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Store className="text-primary text-2xl mr-3" />
              <h1 className="text-xl font-semibold text-gray-900">Distributors and Brands</h1>
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
        <main className="flex-1 overflow-auto">
          <DistributorList />
        </main>
      </div>
    </div>
  );
}
