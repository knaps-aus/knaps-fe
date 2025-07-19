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

const featureSchema = z.object({
  code: z.string().min(1, "Required"),
  title: z.string().min(1, "Required"),
  description: z.string().min(1, "Required"),
  image_url: z.string().optional().or(z.literal("")),
});

export type FeatureForm = z.infer<typeof featureSchema>;

interface CTCFeature {
  id: number;
  external_code: string;
  feature_name: string;
  feature_description: string;
  image_url?: string | null;
}

interface CTCFeaturesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  level: "class" | "type" | "category";
  sourceId: number;
  name: string;
}

export default function CTCFeaturesDialog({
  open,
  onOpenChange,
  level,
  sourceId,
  name,
}: CTCFeaturesDialogProps) {
  const { data: features = [], isLoading } = useQuery<CTCFeature[]>({
    queryKey: ["/ctc/features-benefits/", level, "/", sourceId],
    enabled: open,
  });

  const form = useForm<FeatureForm>({
    resolver: zodResolver(featureSchema),
    defaultValues: { code: "", title: "", description: "", image_url: "" },
  });

  const [editing, setEditing] = React.useState<CTCFeature | null>(null);

  React.useEffect(() => {
    if (editing) {
      form.reset({
        code: editing.external_code || "",
        title: editing.feature_name || "",
        description: editing.feature_description || "",
        image_url: editing.image_url || "",
      });
    } else {
      form.reset({ code: "", title: "", description: "", image_url: "" });
    }
  }, [editing, form]);

  const mutation = useMutation({
    mutationFn: async (data: FeatureForm) => {
      if (editing) {
        return apiRequest(
          "PUT",
          `/ctc/features-benefits/${level}/${editing.id}`,
          {
            external_code: data.code,
            feature_name: data.title,
            feature_description: data.description,
            image_url: data.image_url,
          },
        );
      }
      return apiRequest(`POST`, `/ctc/features-benefits/${level}`, {
        external_code: data.code,
        feature_name: data.title,
        feature_description: data.description,
        image_url: data.image_url,
        source_level: level,
        source_level_id: sourceId,
        [`${level}_id`]: sourceId,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["/ctc/features-benefits/", level, "/", sourceId],
      });
      setEditing(null);
      form.reset();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) =>
      apiRequest("DELETE", `/ctc/features-benefits/${level}/${id}`),
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: ["/ctc/features-benefits/", level, "/", sourceId],
      }),
  });

  const onSubmit = (data: FeatureForm) => {
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
          <DialogTitle>{name} Features &amp; Benefits</DialogTitle>
        </DialogHeader>
        <div className="space-y-6">
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-4"
            >
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
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => setEditing(null)}
                  >
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
                  {features.map((fb) => (
                    <TableRow key={fb.id}>
                      <TableCell>{fb.external_code}</TableCell>
                      <TableCell>{fb.feature_name}</TableCell>
                      <TableCell>{fb.feature_description}</TableCell>
                      <TableCell>{fb.image_url}</TableCell>
                      <TableCell className="space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setEditing(fb)}
                        >
                          Edit
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteMutation.mutate(fb.id)}
                        >
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
