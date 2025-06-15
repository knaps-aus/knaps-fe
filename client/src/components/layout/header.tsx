import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Store, Search, Bell } from "lucide-react";
import ProductSearch from "@/components/product-search";
import type { Product } from "@shared/schema";

interface HeaderProps {
  onProductSelect: (productId: number) => void;
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
              <ProductSearch onProductSelect={onProductSelect} />
            </div>
            <button className="p-2 text-gray-400 hover:text-gray-600">
              <Bell className="text-lg" />
            </button>
            <div className="flex items-center space-x-2">
              <img
                src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=32&h=32"
                alt="User avatar"
                className="w-8 h-8 rounded-full"
              />
              <span className="text-sm text-gray-700">John Manager</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
