import { Box, Boxes, ChartLine, Warehouse, Users, Settings } from "lucide-react";
import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";

const navigation = [
  { name: 'Product Management', href: '/products', icon: Box },
  { name: 'Distributors & Brands', href: '/distributors', icon: Warehouse },
  { name: 'CTC Hierarchy', href: '/ctc', icon: Boxes },
  { name: 'Sales Analytics', href: '#', icon: ChartLine },
  { name: 'Inventory', href: '#', icon: Warehouse },
  { name: 'Customers', href: '#', icon: Users },
  { name: 'Settings', href: '#', icon: Settings },
];

export default function Sidebar() {
  const [location] = useLocation();
  return (
    <aside className="w-64 bg-white shadow-sm border-r border-gray-200">
      <nav className="mt-5 px-2">
        <div className="space-y-1">
          {navigation.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                location.startsWith(item.href)
                  ? 'bg-primary text-white'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900',
                'group flex items-center px-2 py-2 text-sm font-medium rounded-md'
              )}
            >
              <item.icon className="mr-3 flex-shrink-0 h-5 w-5" />
              {item.name}
            </Link>
          ))}
        </div>
      </nav>
    </aside>
  );
}
