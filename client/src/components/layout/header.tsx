import { Store, Search, Bell } from "lucide-react";
import ProductSearch from "@/components/product-search";
import UserMenu from "@/components/user-menu";

interface HeaderProps {
  onProductSelect: (productCode: string) => void;
}

export default function Header({ onProductSelect }: HeaderProps) {
  return (
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Store className="text-primary text-2xl mr-3" />
            <h1 className="text-xl font-semibold text-gray-900">
              Electronics Franchise ERP
            </h1>
          </div>
          <div className="flex items-center space-x-4">
            <div className="relative flex-1 max-w-lg">
              <ProductSearch onSelectProduct={onProductSelect} />
            </div>
            <button className="p-2 text-gray-400 hover:text-gray-600">
              <Bell className="text-lg" />
            </button>
            <UserMenu />
          </div>
        </div>
      </div>
    </header>
  );
}
