import { useQuery } from "@tanstack/react-query";
import Sidebar from "@/components/sidebar";
import UserMenu from "@/components/user-menu";
import { ListTree, Bell } from "lucide-react";
import { TreeView, TreeDataItem } from "@/components/ui/tree-view";

interface CTCCategoryHierarchy {
  id: number;
  uuid: string;
  code: string;
  name: string;
  active: boolean;
  product_id?: number | null;
}

interface CTCTypeHierarchy {
  id: number;
  uuid: string;
  code: string;
  name: string;
  active: boolean;
  categories: CTCCategoryHierarchy[];
}

interface CTCClassHierarchy {
  id: number;
  uuid: string;
  code: string;
  name: string;
  active: boolean;
  types: CTCTypeHierarchy[];
}

export default function CTCHierarchyPage() {
  const { data: hierarchy = [], isLoading } = useQuery<CTCClassHierarchy[]>({
    queryKey: ["/ctc/hierarchy"],
  });

  const treeData: TreeDataItem[] = hierarchy.map((cls) => ({
    id: String(cls.id),
    name: cls.name,
    className: "text-gray-800",
    children: cls.types.map((type) => ({
      id: `t-${type.id}`,
      name: type.name,
      className: "text-gray-600",
      children: type.categories.map((cat) => ({
        id: `c-${cat.id}`,
        name: cat.name,
        className: "text-gray-500",
      })),
    })),
  }));

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <ListTree className="text-primary text-2xl mr-3" />
              <h1 className="text-xl font-semibold text-gray-900">CTC Hierarchy</h1>
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
          {isLoading ? (
            <div>Loading...</div>
          ) : (
            <TreeView data={treeData} expandAll className="bg-white rounded p-4" />
          )}
        </main>
      </div>
    </div>
  );
}
