import { pgTable, text, serial, decimal, integer, boolean, timestamp, varchar, date } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  distributor_name: text("distributor_name").notNull(),
  brand_name: text("brand_name").notNull(),
  product_code: text("product_code").notNull().unique(),
  product_secondary_code: text("product_secondary_code"),
  product_name: text("product_name").notNull(),
  description: text("description"),
  summary: text("summary"),
  shipping_class: text("shipping_class"),
  category_name: text("category_name").notNull(),
  product_availability: text("product_availability").notNull().default("In Stock"),
  status: text("status").notNull().default("Active"),
  online: boolean("online").notNull().default(true),
  superceded_by: text("superceded_by"),
  ean: text("ean"),
  pack_size: integer("pack_size").notNull().default(1),
  mwp: decimal("mwp", { precision: 10, scale: 2 }),
  trade: decimal("trade", { precision: 10, scale: 2 }).notNull(),
  go: decimal("go", { precision: 10, scale: 2 }),
  rrp: decimal("rrp", { precision: 10, scale: 2 }).notNull(),
  core_group: text("core_group"),
  tax_exmt: boolean("tax_exmt").notNull().default(false),
  hyperlink: text("hyperlink"),
  web_title: text("web_title"),
  features_and_benefits_codes: text("features_and_benefits_codes"),
  badges_codes: text("badges_codes"),
  stock_unmanaged: boolean("stock_unmanaged").notNull().default(false),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
});

export const sellIns = pgTable("sell_ins", {
  id: serial("id").primaryKey(),
  product_id: integer("product_id").notNull().references(() => products.id),
  quantity: integer("quantity").notNull(),
  unit_cost: decimal("unit_cost", { precision: 10, scale: 2 }).notNull(),
  total_cost: decimal("total_cost", { precision: 10, scale: 2 }).notNull(),
  transaction_date: date("transaction_date").notNull(),
  month_partition: varchar("month_partition", { length: 7 }).notNull(), // YYYY-MM format
  notes: text("notes"),
  created_at: timestamp("created_at").defaultNow(),
});

export const sellThroughs = pgTable("sell_throughs", {
  id: serial("id").primaryKey(),
  product_id: integer("product_id").notNull().references(() => products.id),
  quantity: integer("quantity").notNull(),
  unit_price: decimal("unit_price", { precision: 10, scale: 2 }).notNull(),
  total_revenue: decimal("total_revenue", { precision: 10, scale: 2 }).notNull(),
  transaction_date: date("transaction_date").notNull(),
  month_partition: varchar("month_partition", { length: 7 }).notNull(), // YYYY-MM format
  customer_info: text("customer_info"),
  created_at: timestamp("created_at").defaultNow(),
});

export const insertProductSchema = createInsertSchema(products).omit({
  id: true,
  created_at: true,
  updated_at: true,
});

export const insertSellInSchema = createInsertSchema(sellIns).omit({
  id: true,
  created_at: true,
});

export const insertSellThroughSchema = createInsertSchema(sellThroughs).omit({
  id: true,
  created_at: true,
});

export type InsertProduct = z.infer<typeof insertProductSchema>;
export type Product = typeof products.$inferSelect;
export type InsertSellIn = z.infer<typeof insertSellInSchema>;
export type SellIn = typeof sellIns.$inferSelect;
export type InsertSellThrough = z.infer<typeof insertSellThroughSchema>;
export type SellThrough = typeof sellThroughs.$inferSelect;

// Analytics types
export type ProductAnalytics = {
  product_id: number;
  product_name: string;
  product_code: string;
  brand_name: string;
  sell_in_quantity: number;
  sell_through_quantity: number;
  turnover_rate: number;
  total_revenue: number;
  current_stock: number;
};

export type OverallAnalytics = {
  total_sell_in: number;
  total_sell_through: number;
  average_turnover_rate: number;
  total_revenue: number;
};

// Deals types
export type DealType =
  | 'sell_in'
  | 'sell_through'
  | 'price_protection'
  | 'off_invoice_discount';

export type DealAmountType = 'quantity' | 'value';

export type DealProvider = 'head office' | 'distributor' | 'narta';

export type Deal = {
  deal_type: DealType;
  product_id: number;
  product_uuid: number;
  deal_id: number;
  deal_uuid: string;
  amount_type: DealAmountType;
  amount: string;
  start_date: string;
  end_date: string;
  yeamonth_partition: string; // YYYY-MM
  provider: DealProvider;
  store_amount?: string | null;
  head_office_amount?: string | null;
  trade_price?: string | null;
  created_at?: string | null;
  created_by?: string | null;
  updated_at?: string | null;
  updated_by?: string | null;
};

// Distributor and Brand types
export type Distributor = {
  id: number;
  uuid: string;
  code: string;
  name: string;
  store: string;
  edi: boolean;
  auto_claim_over_charge: boolean;
  is_central: boolean;
  icon_owner?: string | null;
  gln?: string | null;
  business_number?: string | null;
  accounting_date?: number | null;
  web_portal_url?: string | null;
  pp_claim_from?: string | null;
  fis_minimum_order?: string | null;
  default_extended_credits_code?: string | null;
  default_extended_credits_name?: string | null;
  active: boolean;
  modified_by: string;
  modified: string;
  created_by: string;
  created: string;
  deleted_by?: string | null;
  deleted?: string | null;
};

export type Brand = {
  id: number;
  uuid: string;
  code: string;
  name: string;
  store: string;
  distributor_id: number;
  is_hof_pref: boolean;
  comments?: string | null;
  narta_rept: boolean;
  active: boolean;
  modified_by: string;
  modified: string;
  created_by: string;
  created: string;
  deleted_by?: string | null;
  deleted?: string | null;
};
