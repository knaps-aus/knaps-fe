import { Box, ChartLine, Warehouse, Users, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

const navigation = [
  { name: 'Product Management', href: '#', icon: Box, current: true },
  { name: 'Sales Analytics', href: '#', icon: ChartLine, current: false },
  { name: 'Inventory', href: '#', icon: Warehouse, current: false },
  { name: 'Customers', href: '#', icon: Users, current: false },
  { name: 'Settings', href: '#', icon: Settings, current: false },
];

export default function Sidebar() {
  return (
    <aside className="w-64 bg-white shadow-sm border-r border-gray-200">
      <nav className="mt-5 px-2">
        <div className="space-y-1">
          {navigation.map((item) => (
            <a
              key={item.name}
              href={item.href}
              className={cn(
                item.current
                  ? 'bg-primary text-white'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900',
                'group flex items-center px-2 py-2 text-sm font-medium rounded-md'
              )}
            >
              <item.icon className="mr-3 flex-shrink-0 h-5 w-5" />
              {item.name}
            </a>
          ))}
        </div>
      </nav>
    </aside>
  );
}
