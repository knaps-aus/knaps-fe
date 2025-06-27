import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import ProductSearchWithId from "@/components/product-search-with-id";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Plus, Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import type { Deal } from "@shared/schema";

const insertDealSchema = z.object({
  product_id: z.number().int(),
  deal_type: z.enum(["sell_in", "sell_through", "price_protection", "off_invoice_discount"]),
  amount_type: z.enum(["quantity", "value"]),
  amount: z.string(),
  start_date: z.string(),
  end_date: z.string(),
  yeamonth_partition: z.string().min(7).max(7),
  provider: z.enum(["head office", "distributor", "narta"]),
  store_amount: z.string().optional().nullable(),
  head_office_amount: z.string().optional().nullable(),
  trade_price: z.string().optional().nullable(),
});

export type InsertDeal = z.infer<typeof insertDealSchema>;

interface AddDealProps {
  deal?: Deal;
  onClose?: () => void;
}

export default function AddDeal({ deal, onClose }: AddDealProps) {
  const isEditing = !!deal;
  const { toast } = useToast();

  const form = useForm<InsertDeal>({
    resolver: zodResolver(insertDealSchema),
    defaultValues: isEditing
      ? {
          product_id: deal!.product_id,
          deal_type: deal!.deal_type,
          amount_type: deal!.amount_type,
          amount: deal!.amount,
          start_date: deal!.start_date,
          end_date: deal!.end_date,
          yeamonth_partition: deal!.yeamonth_partition,
          provider: deal!.provider,
          store_amount: deal!.store_amount || undefined,
          head_office_amount: deal!.head_office_amount || undefined,
          trade_price: deal!.trade_price || undefined,
        }
      : {
          product_id: 0,
          deal_type: "sell_in",
          amount_type: "quantity",
          amount: "",
          start_date: "",
          end_date: "",
          yeamonth_partition: "",
          provider: "head office",
          store_amount: undefined,
          head_office_amount: undefined,
          trade_price: undefined,
        },
  });

  const mutation = useMutation({
    mutationFn: async (data: InsertDeal) => {
      if (isEditing) {
        const res = await apiRequest("PUT", `/deals/${deal!.deal_uuid}`, data);
        return res.json();
      }
      const res = await apiRequest("POST", "/deals", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/deals"] });
      if (isEditing) {
        onClose && onClose();
        toast({ title: "Success", description: "Deal updated successfully" });
      } else {
        form.reset();
        toast({ title: "Success", description: "Deal created successfully" });
      }
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description:
          error.message ||
          (isEditing ? "Failed to update deal" : "Failed to create deal"),
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: InsertDeal) => {
    mutation.mutate(data);
  };

  return (
    <div className="p-6">
      <Card>
        <CardHeader>
          <CardTitle>{isEditing ? 'Edit Deal' : 'Add Deal'}</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="product_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Product</FormLabel>
                      {isEditing ? (
                        <FormControl>
                          <Input type="number" {...field} disabled />
                        </FormControl>
                      ) : (
                        <ProductSearchWithId
                          onSelectProduct={(product) => field.onChange(product.id)}
                        />
                      )}
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="deal_type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Deal Type</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="sell_in">Sell In</SelectItem>
                          <SelectItem value="sell_through">Sell Through</SelectItem>
                          <SelectItem value="price_protection">Price Protection</SelectItem>
                          <SelectItem value="off_invoice_discount">Off Invoice Discount</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="amount_type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Amount Type</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="quantity">Quantity</SelectItem>
                          <SelectItem value="value">Value</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="amount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Amount</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="start_date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Start Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="end_date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>End Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="yeamonth_partition"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Year-Month</FormLabel>
                      <FormControl>
                        <Input placeholder="YYYY-MM" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="provider"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Provider</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Provider" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="head office">Head Office</SelectItem>
                          <SelectItem value="distributor">Distributor</SelectItem>
                          <SelectItem value="narta">Narta</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="store_amount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Store Amount</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="head_office_amount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Head Office Amount</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="trade_price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Trade Price</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="flex justify-end space-x-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => (isEditing ? onClose && onClose() : form.reset())}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={mutation.isPending}>
                  {isEditing ? (
                    <Save className="h-4 w-4 mr-2" />
                  ) : (
                    <Plus className="h-4 w-4 mr-2" />
                  )}
                  {mutation.isPending
                    ? isEditing
                      ? "Saving..."
                      : "Adding..."
                    : isEditing
                    ? "Save Deal"
                    : "Add Deal"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
