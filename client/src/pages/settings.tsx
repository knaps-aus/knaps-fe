import Sidebar from "@/components/sidebar";
import UserMenu from "@/components/user-menu";
import { Settings as SettingsIcon, Bell } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useTheme } from "@/components/theme-provider";

export default function SettingsPage() {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <SettingsIcon className="text-primary text-2xl mr-3" />
              <h1 className="text-xl font-semibold text-gray-900">Settings</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Bell className="h-5 w-5 text-gray-400" />
              <UserMenu />
            </div>
          </div>
        </div>
      </header>
      <div className="flex h-screen pt-16">
        <Sidebar />
        <main className="flex-1 overflow-auto p-6">
          <div className="max-w-md mx-auto bg-white p-6 rounded shadow-sm">
            <div className="flex items-center justify-between">
              <Label htmlFor="theme-toggle">Dark Mode</Label>
              <Switch id="theme-toggle" checked={theme === "dark"} onCheckedChange={toggleTheme} />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
