import Sidebar from "@/components/sidebar";
import UserMenu from "@/components/user-menu";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Store, Bell } from "lucide-react";

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
  const { data: classes = [], isLoading } = useQuery<CTCClassHierarchy[]>({
    queryKey: ["/ctc/hierarchy"],
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Store className="text-primary text-2xl mr-3" />
              <h1 className="text-xl font-semibold text-gray-900">CTC Hierarchy</h1>
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
        <main className="flex-1 overflow-auto p-6 space-y-6">
          {isLoading ? (
            <div>Loading...</div>
          ) : (
            classes.map((cls) => (
              <Card key={cls.id} className="">
                <CardHeader>
                  <CardTitle>{cls.name}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {cls.types.map((type) => (
                    <div key={type.id}>
                      <div className="font-semibold text-gray-700">{type.name}</div>
                      <ul className="ml-4 list-disc">
                        {type.categories.map((cat) => (
                          <li key={cat.id} className="text-gray-600">
                            {cat.name}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </CardContent>
              </Card>
            ))
          )}
        </main>
      </div>
    </div>
  );
}

