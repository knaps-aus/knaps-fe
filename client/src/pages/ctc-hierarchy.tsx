import React from "react";
import { useQuery } from "@tanstack/react-query";
import Sidebar from "@/components/sidebar";
import UserMenu from "@/components/user-menu";
import { ListTree, Bell } from "lucide-react";
import { TreeView, TreeDataItem } from "@/components/ui/tree-view";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import CTCFeaturesDialog from "@/components/ctc-features-dialog";
import CTCAttributesDialog from "@/components/ctc-attributes-dialog";

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
  const [query, setQuery] = React.useState("");
  const [fbTarget, setFbTarget] = React.useState<
    | { level: "class" | "type" | "category"; id: number; name: string }
    | null
  >(null);
  const [attrTarget, setAttrTarget] = React.useState<
    | { id: number; name: string }
    | null
  >(null);

  const filteredHierarchy = React.useMemo(() => {
    if (!query.trim()) return hierarchy;
    const q = query.toLowerCase();
    return hierarchy.reduce<CTCClassHierarchy[]>((acc, cls) => {
      const classMatch = cls.name.toLowerCase().includes(q);
      if (classMatch) {
        acc.push(cls);
        return acc;
      }
      const types = cls.types.reduce<CTCTypeHierarchy[]>((typeAcc, type) => {
        const typeMatch = type.name.toLowerCase().includes(q);
        if (typeMatch) {
          typeAcc.push(type);
          return typeAcc;
        }
        const categories = type.categories.filter((cat) =>
          cat.name.toLowerCase().includes(q),
        );
        if (categories.length) {
          typeAcc.push({ ...type, categories });
        }
        return typeAcc;
      }, []);
      if (types.length) {
        acc.push({ ...cls, types });
      }
      return acc;
    }, []);
  }, [hierarchy, query]);

  const treeData: TreeDataItem[] = filteredHierarchy.map((cls) => ({
    id: String(cls.id),
    name: cls.name,
    className: "text-gray-800",
    actions: (
      <Button
        variant="secondary"
        size="sm"
        className="text-gray-800"
        onClick={(e) => {
          e.stopPropagation();
          setFbTarget({ level: "class", id: cls.id, name: cls.name });
        }}
      >
        Features
      </Button>
    ),
    children: cls.types.map((type) => ({
      id: `t-${type.id}`,
      name: type.name,
      className: "text-gray-600",
      actions: (
        <Button
        variant="secondary"
        size="sm"
        className="text-gray-800"
          onClick={(e) => {
            e.stopPropagation();
            setFbTarget({ level: "type", id: type.id, name: type.name });
          }}
        >
          Features
        </Button>
      ),
      children: type.categories.map((cat) => ({
        id: `c-${cat.id}`,
        name: cat.name,
        className: "text-gray-500",
        actions: (
          <div className="space-x-2">
            <Button
              variant="secondary"
              size="sm"
              className="text-gray-800"
              onClick={(e) => {
                e.stopPropagation();
                setFbTarget({ level: "category", id: cat.id, name: cat.name });
              }}
            >
              Features
            </Button>
            <Button
              variant="secondary"
              size="sm"
              className="text-gray-800"
              onClick={(e) => {
                e.stopPropagation();
                setAttrTarget({ id: cat.id, name: cat.name });
              }}
            >
              Attributes
            </Button>
          </div>
        ),
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
            <>
              <div className="mb-4 relative max-w-md">
                <Input
                  placeholder="Search hierarchy..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="pl-8"
                />
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
              </div>
              <TreeView data={treeData} expandAll className="bg-white rounded p-4" />
              {fbTarget && (
                <CTCFeaturesDialog
                  open={!!fbTarget}
                  onOpenChange={(o) => !o && setFbTarget(null)}
                  level={fbTarget.level}
                  sourceId={fbTarget.id}
                  name={fbTarget.name}
                />
              )}
              {attrTarget && (
                <CTCAttributesDialog
                  open={!!attrTarget}
                  onOpenChange={(o) => !o && setAttrTarget(null)}
                  categoryId={attrTarget.id}
                  name={attrTarget.name}
                />
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
}
