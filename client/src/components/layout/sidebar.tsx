import { Package, TrendingUp, Warehouse, Users, Settings } from "lucide-react";

const navigation = [
  { name: "Product Management", icon: Package, current: true },
  { name: "Sales Analytics", icon: TrendingUp, current: false },
  { name: "Inventory", icon: Warehouse, current: false },
  { name: "Customers", icon: Users, current: false },
  { name: "Settings", icon: Settings, current: false },
];

export default function Sidebar() {
  return (
    <aside className="w-64 bg-white shadow-sm border-r border-gray-200">
      <nav className="mt-5 px-2">
        <div className="space-y-1">
          {navigation.map((item) => {
            const Icon = item.icon;
            return (
              <a
                key={item.name}
                href="#"
                className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                  item.current
                    ? "bg-primary text-white"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                }`}
              >
                <Icon className="mr-3 h-5 w-5" />
                {item.name}
              </a>
            );
          })}
        </div>
      </nav>
    </aside>
  );
}
