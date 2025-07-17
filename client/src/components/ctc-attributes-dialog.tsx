import React from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery, useMutation } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { apiRequest, queryClient } from "@/lib/queryClient";

const attrSchema = z.object({
  code: z.string().min(1, "Required"),
  title: z.string().min(1, "Required"),
  description: z.string().min(1, "Required"),
  image_url: z.string().optional().or(z.literal("")),
});

export type AttributeForm = z.infer<typeof attrSchema>;

interface CategoryAttribute {
  id: number;
  code: string;
  title: string;
  description: string;
  image_url?: string | null;
}

interface CTCAttributesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  categoryId: number;
  name: string;
}

export default function CTCAttributesDialog({
  open,
  onOpenChange,
  categoryId,
  name,
}: CTCAttributesDialogProps) {
  const { data: attributes = [], isLoading } = useQuery<CategoryAttribute[]>({
    queryKey: ["/ctc/categories/", categoryId, "/attributes"],
    enabled: open,
  });

  const form = useForm<AttributeForm>({
    resolver: zodResolver(attrSchema),
    defaultValues: { code: "", title: "", description: "", image_url: "" },
  });

  const [editing, setEditing] = React.useState<CategoryAttribute | null>(null);

  React.useEffect(() => {
    if (editing) {
      form.reset({
        code: editing.code || "",
        title: editing.title || "",
        description: editing.description || "",
        image_url: editing.image_url || "",
      });
    } else {
      form.reset({ code: "", title: "", description: "", image_url: "" });
    }
  }, [editing, form]);

  const mutation = useMutation({
    mutationFn: async (data: AttributeForm) => {
      if (editing) {
        return apiRequest(
          "PUT",
          `/ctc/attributes/${editing.id}`,
          {
            code: data.code,
            title: data.title,
            description: data.description,
            image_url: data.image_url,
            category_id: categoryId,
          },
        );
      }
      return apiRequest("POST", `/ctc/attributes`, {
        category_id: categoryId,
        code: data.code,
        title: data.title,
        description: data.description,
        image_url: data.image_url,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["/ctc/categories/", categoryId, "/attributes"],
      });
      setEditing(null);
      form.reset();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) =>
      apiRequest("DELETE", `/ctc/attributes/${id}`),
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: ["/ctc/categories/", categoryId, "/attributes"],
      }),
  });

  const onSubmit = (data: AttributeForm) => {
    mutation.mutate(data);
  };

  const close = (o: boolean) => {
    if (!o) {
      setEditing(null);
      form.reset();
    }
    onOpenChange(o);
  };

  return (
    <Dialog open={open} onOpenChange={close}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{name} Attributes</DialogTitle>
        </DialogHeader>
        <div className="space-y-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="code"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Code</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem className="col-span-2">
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="image_url"
                  render={({ field }) => (
                    <FormItem className="col-span-2">
                      <FormLabel>Image URL</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="flex justify-end space-x-2">
                {editing && (
                  <Button type="button" variant="secondary" onClick={() => setEditing(null)}>
                    Cancel
                  </Button>
                )}
                <Button type="submit" disabled={mutation.isPending}>
                  {editing ? "Update" : "Add"}
                </Button>
              </div>
            </form>
          </Form>
          <div>
            {isLoading ? (
              <div>Loading...</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Code</TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Image URL</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {attributes.map((attr) => (
                    <TableRow key={attr.id}>
                      <TableCell>{attr.code}</TableCell>
                      <TableCell>{attr.title}</TableCell>
                      <TableCell>{attr.description}</TableCell>
                      <TableCell>{attr.image_url}</TableCell>
                      <TableCell className="space-x-2">
                        <Button variant="ghost" size="sm" onClick={() => setEditing(attr)}>
                          Edit
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => deleteMutation.mutate(attr.id)}>
                          Delete
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
