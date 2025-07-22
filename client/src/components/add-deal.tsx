import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import ProductSearchWithId from "@/components/product-search-with-id";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Plus, Save, Search } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import type { Deal } from "@shared/schema";
import { useState } from "react";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";

// Types for the new fields
interface Distributor {
  id: number;
  uuid: string;
  code: string;
  name: string;
  store: string;
  edi: boolean;
  auto_claim_over_charge: boolean;
  is_central: boolean;
  active: boolean;
}

interface BrandWithDistributor {
  id: number;
  uuid: string;
  code: string;
  name: string;
  store: string;
  distributor_id: number;
  is_hof_pref: boolean;
  comments: string;
  narta_rept: boolean;
  active: boolean;
  distributor: Distributor;
}

interface DealSource {
  id: number;
  uuid: string;
  code: string;
  name: string;
  store: string;
  for_hoff_only: boolean;
  active: boolean;
}

interface DealType {
  id: number;
  uuid: string;
  code: string;
  name: string;
  store: string;
  rank: number;
  bonus_class: string;
  claimable: boolean;
  deductable: boolean;
  active: boolean;
}

interface CTCCategory {
  id: number;
  uuid: string;
  code: string;
  name: string;
  active: boolean;
  product_id?: number | null;
}

interface CTCType {
  id: number;
  uuid: string;
  code: string;
  name: string;
  active: boolean;
  categories: CTCCategory[];
}

interface CTCClass {
  id: number;
  uuid: string;
  code: string;
  name: string;
  active: boolean;
  types: CTCType[];
}

const insertDealSchema = z.object({
  brand_id: z.number().int(),
  deal_type: z.enum(["sell_in", "sell_through", "price_protection", "off_invoice_discount"]),
  amount_type: z.enum(["quantity", "value"]),
  amount: z.string(),
  start_date: z.string(),
  end_date: z.string(),
  yeamonth_partition: z.string().min(7).max(7),
  store_amount: z.string().optional().nullable(),
  head_office_amount: z.string().optional().nullable(),
  trade_price: z.string().optional().nullable(),
  // New fields
  deal_source_id: z.number().optional().nullable(),
  deal_type_id: z.number().optional().nullable(),
  product_class_id: z.number().optional().nullable(),
  product_type_id: z.number().optional().nullable(),
  product_category_id: z.number().optional().nullable(),
});

export type InsertDeal = z.infer<typeof insertDealSchema>;

interface AddDealProps {
  deal?: Deal;
  onClose?: () => void;
}

export default function AddDeal({ deal, onClose }: AddDealProps) {
  const isEditing = !!deal;
  const { toast } = useToast();
  
  // State for CTC hierarchy selection
  const [selectedClassId, setSelectedClassId] = useState<number | null>(null);
  const [selectedTypeId, setSelectedTypeId] = useState<number | null>(null);
  const [brandOpen, setBrandOpen] = useState(false);

  // Fetch brands with distributors
  const { data: brandsWithDistributors = [] } = useQuery<BrandWithDistributor[]>({
    queryKey: ["/brands/with-distributor"],
  });

  // Fetch deal sources
  const { data: dealSources = [] } = useQuery<DealSource[]>({
    queryKey: ["/rebates/deal-sources"],
  });

  // Fetch deal types
  const { data: dealTypes = [] } = useQuery<DealType[]>({
    queryKey: ["/rebates/deal-types"],
  });

  // Fetch CTC hierarchy
  const { data: ctcHierarchy = [] } = useQuery<CTCClass[]>({
    queryKey: ["/ctc/hierarchy"],
  });

  const form = useForm<InsertDeal>({
    resolver: zodResolver(insertDealSchema),
    defaultValues: isEditing
      ? {
          brand_id: deal!.product_id, // Temporarily using product_id, will need to be updated
          deal_type: deal!.deal_type,
          amount_type: deal!.amount_type,
          amount: deal!.amount,
          start_date: deal!.start_date,
          end_date: deal!.end_date,
          yeamonth_partition: deal!.yeamonth_partition,
          store_amount: deal!.store_amount || undefined,
          head_office_amount: deal!.head_office_amount || undefined,
          trade_price: deal!.trade_price || undefined,
          deal_source_id: undefined,
          deal_type_id: undefined,
          product_class_id: undefined,
          product_type_id: undefined,
          product_category_id: undefined,
        }
      : {
          brand_id: 0,
          deal_type: "sell_in",
          amount_type: "quantity",
          amount: "",
          start_date: "",
          end_date: "",
          yeamonth_partition: "",
          store_amount: undefined,
          head_office_amount: undefined,
          trade_price: undefined,
          deal_source_id: undefined,
          deal_type_id: undefined,
          product_class_id: undefined,
          product_type_id: undefined,
          product_category_id: undefined,
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
        setSelectedClassId(null);
        setSelectedTypeId(null);
        setBrandOpen(false);
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

  // Get selected class types
  const selectedClass = ctcHierarchy.find(cls => cls.id === selectedClassId);
  const availableTypes = selectedClass?.types || [];

  // Get selected type categories
  const selectedType = availableTypes.find(type => type.id === selectedTypeId);
  const availableCategories = selectedType?.categories || [];

  // Get selected brand for display
  const selectedBrand = brandsWithDistributors.find(brand => brand.id === form.watch("brand_id"));

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
                  name="brand_id"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Brand (Distributor)</FormLabel>
                      <Popover open={brandOpen} onOpenChange={setBrandOpen}>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              role="combobox"
                              aria-expanded={brandOpen}
                              className="w-full justify-between"
                              disabled={isEditing}
                            >
                              {field.value
                                ? selectedBrand
                                  ? `${selectedBrand.name} (${selectedBrand.distributor.name})`
                                  : "Select brand..."
                                : "Select brand..."}
                              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-full p-0">
                          <Command>
                            <CommandInput placeholder="Search brands..." />
                            <CommandList>
                              <CommandEmpty>No brand found.</CommandEmpty>
                              <CommandGroup>
                                {brandsWithDistributors.map((brand) => (
                                  <CommandItem
                                    key={brand.id}
                                    value={`${brand.name} ${brand.distributor.name}`}
                                    onSelect={() => {
                                      field.onChange(brand.id);
                                      setBrandOpen(false);
                                    }}
                                  >
                                    <Check
                                      className={cn(
                                        "mr-2 h-4 w-4",
                                        brand.id === field.value
                                          ? "opacity-100"
                                          : "opacity-0"
                                      )}
                                    />
                                    {brand.name} ({brand.distributor.name})
                                  </CommandItem>
                                ))}
                              </CommandGroup>
                            </CommandList>
                          </Command>
                        </PopoverContent>
                      </Popover>
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
                  name="deal_source_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Deal Source</FormLabel>
                      <Select 
                        onValueChange={(value) => field.onChange(value ? parseInt(value) : null)} 
                        value={field.value?.toString() || ""}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select deal source" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {dealSources.map((source) => (
                            <SelectItem key={source.id} value={source.id.toString()}>
                              {source.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="deal_type_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Deal Type ID</FormLabel>
                      <Select 
                        onValueChange={(value) => field.onChange(value ? parseInt(value) : null)} 
                        value={field.value?.toString() || ""}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select deal type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {dealTypes.map((type) => (
                            <SelectItem key={type.id} value={type.id.toString()}>
                              {type.name}
                            </SelectItem>
                          ))}
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
                        <Input
                          type="number"
                          step="0.01"
                          {...field}
                          value={field.value ?? ""}
                        />
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
                  name="store_amount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Store Amount</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          {...field}
                          value={field.value ?? ""}
                        />
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
                        <Input
                          type="number"
                          step="0.01"
                          {...field}
                          value={field.value ?? ""}
                        />
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
                        <Input
                          type="number"
                          step="0.01"
                          {...field}
                          value={field.value ?? ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* CTC Hierarchy Section */}
              <div className="border-t pt-6">
                <h3 className="text-lg font-medium mb-4">CTC Hierarchy (Optional)</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="product_class_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>CTC Class</FormLabel>
                        <Select 
                          onValueChange={(value) => {
                            const classId = value ? parseInt(value) : null;
                            field.onChange(classId);
                            setSelectedClassId(classId);
                            setSelectedTypeId(null);
                            form.setValue("product_type_id", null);
                            form.setValue("product_category_id", null);
                          }} 
                          value={field.value?.toString() || ""}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select class" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {ctcHierarchy.map((cls) => (
                              <SelectItem key={cls.id} value={cls.id.toString()}>
                                {cls.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="product_type_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>CTC Type</FormLabel>
                        <Select 
                          onValueChange={(value) => {
                            const typeId = value ? parseInt(value) : null;
                            field.onChange(typeId);
                            setSelectedTypeId(typeId);
                            form.setValue("product_category_id", null);
                          }} 
                          value={field.value?.toString() || ""}
                          disabled={!selectedClassId}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {availableTypes.map((type) => (
                              <SelectItem key={type.id} value={type.id.toString()}>
                                {type.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="product_category_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>CTC Category</FormLabel>
                        <Select 
                          onValueChange={(value) => field.onChange(value ? parseInt(value) : null)} 
                          value={field.value?.toString() || ""}
                          disabled={!selectedTypeId}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {availableCategories.map((category) => (
                              <SelectItem key={category.id} value={category.id.toString()}>
                                {category.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
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
