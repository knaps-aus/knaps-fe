import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";
import { apiRequest, queryClient } from "@/lib/queryClient";
import DealSearch from "@/components/deal-search";

const insertDealSchema = z.object({
  product_id: z.number().min(1, { message: "Select a product" }),
  deal_type: z.enum(["sell_in", "sell_through", "price_protection", "off_invoice_discount"]),
  amount_type: z.enum(["quantity", "value"]),
  amount: z.preprocess((v) => Number(v), z.number()),
  start_date: z.string().min(1),
  end_date: z.string().min(1),
  provider: z.enum(["head office", "distributor", "narta"]),
  store_amount: z.preprocess((v) => (v === "" || v === null ? undefined : Number(v)), z.number().optional()),
  head_office_amount: z.preprocess((v) => (v === "" || v === null ? undefined : Number(v)), z.number().optional()),
  trade_price: z.preprocess((v) => (v === "" || v === null ? undefined : Number(v)), z.number().optional()),
});

type InsertDeal = z.infer<typeof insertDealSchema>;

export default function AddDeal() {
  const { toast } = useToast();
  const form = useForm<InsertDeal>({
    resolver: zodResolver(insertDealSchema),
    defaultValues: {
      product_id: 0,
      deal_type: "sell_in",
      amount_type: "quantity",
      amount: 0,
      start_date: "",
      end_date: "",
      provider: "head office",
      store_amount: undefined,
      head_office_amount: undefined,
      trade_price: undefined,
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: InsertDeal) => {
      return apiRequest("POST", "/deals", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/deals"] });
      form.reset();
      toast({ title: "Success", description: "Deal created successfully" });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create deal",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: InsertDeal) => {
    createMutation.mutate(data);
  };

  return (
    <div className="p-6">
      <Card>
        <CardHeader>
          <CardTitle>Add New Deal</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="product_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Product</FormLabel>
                    <FormControl>
                      <div>
                        <DealSearch onSelectDeal={(id) => field.onChange(id)} />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="deal_type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Deal Type</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
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
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select" />
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
                        <Input type="number" step="any" {...field} />
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
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select" />
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
                  name="store_amount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Store Amount</FormLabel>
                      <FormControl>
                        <Input type="number" step="any" {...field} />
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
                        <Input type="number" step="any" {...field} />
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
                        <Input type="number" step="any" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <Button type="submit" disabled={createMutation.isPending}>
                {createMutation.isPending ? "Saving..." : "Save Deal"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
