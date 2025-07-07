import Sidebar from "@/components/sidebar";
import UserMenu from "@/components/user-menu";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
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

  const [openClasses, setOpenClasses] = useState<string[]>([]);
  const [openTypes, setOpenTypes] = useState<Record<number, string[]>>({});

  const expandAll = () => {
    const classValues = classes.map((cls) => `class-${cls.id}`);
    const typeState: Record<number, string[]> = {};
    classes.forEach((cls) => {
      typeState[cls.id] = cls.types.map((t) => `type-${t.id}`);
    });
    setOpenClasses(classValues);
    setOpenTypes(typeState);
  };

  const collapseAll = () => {
    setOpenClasses([]);
    setOpenTypes({});
  };

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
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={expandAll}>
              Expand All
            </Button>
            <Button variant="outline" onClick={collapseAll}>
              Collapse All
            </Button>
          </div>
          {isLoading ? (
            <div>Loading...</div>
          ) : (
            <Accordion
              type="multiple"
              className="space-y-4"
              value={openClasses}
              onValueChange={setOpenClasses}
            >
              {classes.map((cls) => (
                <AccordionItem value={`class-${cls.id}`} key={cls.id}>
                  <Card>
                    <AccordionTrigger className="px-4 py-2 text-lg font-semibold text-left">
                      {cls.name}
                    </AccordionTrigger>
                    <AccordionContent>
                      <CardContent className="space-y-2">
                        <Accordion
                          type="multiple"
                          className="space-y-2"
                          value={openTypes[cls.id] ?? []}
                          onValueChange={(v) =>
                            setOpenTypes((prev) => ({ ...prev, [cls.id]: v }))
                          }
                        >
                          {cls.types.map((type) => (
                            <AccordionItem value={`type-${type.id}`} key={type.id}>
                              <AccordionTrigger className="px-4 py-2 bg-gray-50 rounded text-left font-medium">
                                {type.name}
                              </AccordionTrigger>
                              <AccordionContent>
                                <div className="space-y-1 p-2">
                                  {type.categories.map((cat) => (
                                    <div
                                      key={cat.id}
                                      className="text-sm text-gray-700 bg-gray-100 rounded px-2 py-1"
                                    >
                                      {cat.name}
                                    </div>
                                  ))}
                                </div>
                              </AccordionContent>
                            </AccordionItem>
                          ))}
                        </Accordion>
                      </CardContent>
                    </AccordionContent>
                  </Card>
                </AccordionItem>
              ))}
            </Accordion>
          )}
        </main>
      </div>
    </div>
  );
}

