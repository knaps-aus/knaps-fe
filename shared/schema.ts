import { pgTable, text, serial, decimal, integer, boolean, timestamp, varchar, date } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Price Level table
export const priceLevels = pgTable("price_levels", {
  id: serial("id").primaryKey(),
  uuid: text("uuid"),
  product_id: integer("product_id").references(() => products.id),
  price_level: text("price_level").notNull(), // "MWP", "Trade", "GO", "RRP"
  type: text("type").notNull(), // "Standard", "Promotional", "Bulk", etc.
  value_excl: decimal("value_excl", { precision: 10, scale: 2 }).notNull(),
  value_incl: decimal("value_incl", { precision: 10, scale: 2 }),
  comments: text("comments"),
  valid_start: text("valid_start"),
  valid_end: text("valid_end"),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
});

// My Price table
export const myPrices = pgTable("my_prices", {
  id: serial("id").primaryKey(),
  uuid: text("uuid"),
  product_id: integer("product_id").references(() => products.id),
  active: boolean("active").default(true),
  
  // Basic pricing fields
  go: decimal("go", { precision: 10, scale: 2 }),
  go_special: decimal("go_special", { precision: 10, scale: 2 }),
  rrp: decimal("rrp", { precision: 10, scale: 2 }),
  rrp_special: decimal("rrp_special", { precision: 10, scale: 2 }),
  trade: decimal("trade", { precision: 10, scale: 2 }),
  off_invoice: decimal("off_invoice", { precision: 10, scale: 2 }),
  invoice: decimal("invoice", { precision: 10, scale: 2 }),
  
  // Percentage and dollar amounts
  vendor_percent: decimal("vendor_percent", { precision: 10, scale: 2 }),
  vendor_dollar: decimal("vendor_dollar", { precision: 10, scale: 2 }),
  bonus_percent: decimal("bonus_percent", { precision: 10, scale: 2 }),
  bonus_dollar: decimal("bonus_dollar", { precision: 10, scale: 2 }),
  brand_percent: decimal("brand_percent", { precision: 10, scale: 2 }),
  hoff_percent: decimal("hoff_percent", { precision: 10, scale: 2 }),
  hoff_dollar: decimal("hoff_dollar", { precision: 10, scale: 2 }),
  net: decimal("net", { precision: 10, scale: 2 }),
  sellthru_dollar: decimal("sellthru_dollar", { precision: 10, scale: 2 }),
  nac: decimal("nac", { precision: 10, scale: 2 }),
  
  // Hoff-specific fields
  off_invoice_hoff: decimal("off_invoice_hoff", { precision: 10, scale: 2 }),
  invoice_hoff: decimal("invoice_hoff", { precision: 10, scale: 2 }),
  vendor_percent_hoff: decimal("vendor_percent_hoff", { precision: 10, scale: 2 }),
  vendor_dollar_hoff: decimal("vendor_dollar_hoff", { precision: 10, scale: 2 }),
  bonus_percent_hoff: decimal("bonus_percent_hoff", { precision: 10, scale: 2 }),
  bonus_dollar_hoff: decimal("bonus_dollar_hoff", { precision: 10, scale: 2 }),
  brand_percent_hoff: decimal("brand_percent_hoff", { precision: 10, scale: 2 }),
  net_hoff: decimal("net_hoff", { precision: 10, scale: 2 }),
  sellthru_dollar_hoff: decimal("sellthru_dollar_hoff", { precision: 10, scale: 2 }),
  nac_hoff: decimal("nac_hoff", { precision: 10, scale: 2 }),
  
  // Timestamps
  created_at: timestamp("created_at").defaultNow(),
  modified_at: timestamp("modified_at").defaultNow(),
});

// Distributors table
export const distributors = pgTable("distributors", {
  id: serial("id").primaryKey(),
  uuid: text("uuid").notNull(),
  code: text("code").notNull(),
  name: text("name").notNull(),
  store: text("store").notNull(),
  edi: boolean("edi").notNull(),
  auto_claim_over_charge: boolean("auto_claim_over_charge").notNull(),
  is_central: boolean("is_central").notNull(),
  icon_owner: text("icon_owner"),
  gln: text("gln"),
  business_number: text("business_number"),
  accounting_date: integer("accounting_date"),
  web_portal_url: text("web_portal_url"),
  pp_claim_from: text("pp_claim_from"),
  fis_minimum_order: text("fis_minimum_order"),
  default_extended_credits_code: text("default_extended_credits_code"),
  default_extended_credits_name: text("default_extended_credits_name"),
  active: boolean("active").notNull(),
  modified_by: text("modified_by").notNull(),
  modified: timestamp("modified").notNull(),
  created_by: text("created_by").notNull(),
  created: timestamp("created").notNull(),
  deleted_by: text("deleted_by"),
  deleted: timestamp("deleted"),
});

// Brands table
export const brands = pgTable("brands", {
  id: serial("id").primaryKey(),
  uuid: text("uuid").notNull(),
  code: text("code").notNull(),
  name: text("name").notNull(),
  store: text("store").notNull(),
  distributor_id: integer("distributor_id").notNull().references(() => distributors.id),
  is_hof_pref: boolean("is_hof_pref").notNull(),
  comments: text("comments"),
  narta_rept: boolean("narta_rept").notNull(),
  active: boolean("active").notNull(),
  modified_by: text("modified_by").notNull(),
  modified: timestamp("modified").notNull(),
  created_by: text("created_by").notNull(),
  created: timestamp("created").notNull(),
  deleted_by: text("deleted_by"),
  deleted: timestamp("deleted"),
});

// Products table (updated structure)
export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  uuid: text("uuid"),
  distributor_id: integer("distributor_id").references(() => distributors.id),
  distributor_name: text("distributor_name"),
  brand_id: integer("brand_id").references(() => brands.id),
  brand_name: text("brand_name"),
  product_code: text("product_code").notNull().unique(),
  product_secondary_code: text("product_secondary_code"),
  product_name: text("product_name").notNull(),
  description: text("description"),
  summary: text("summary"),
  shipping_class: text("shipping_class"),
  category_name: text("category_name"),
  product_availability: text("product_availability").default("In Stock"),
  status: text("status").default("Active"),
  online: boolean("online").default(true),
  superceded_by: text("superceded_by"),
  ean: text("ean"),
  pack_size: integer("pack_size").default(1),
  core_group: text("core_group"),
  tax_exmt: boolean("tax_exmt").default(false),
  hyperlink: text("hyperlink"),
  web_title: text("web_title"),
  features_and_benefits_codes: text("features_and_benefits_codes"),
  badges_codes: text("badges_codes"),
  stock_unmanaged: boolean("stock_unmanaged").default(false),
  ctc_class_id: integer("ctc_class_id"),
  ctc_class_name: text("ctc_class_name"),
  ctc_type_id: integer("ctc_type_id"),
  ctc_type_name: text("ctc_type_name"),
  ctc_category_id: integer("ctc_category_id"),
  ctc_category_name: text("ctc_category_name"),
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

// Insert schemas
export const insertProductSchema = createInsertSchema(products).omit({
  id: true,
  created_at: true,
  updated_at: true,
});

export const insertPriceLevelSchema = createInsertSchema(priceLevels).omit({
  id: true,
  created_at: true,
  updated_at: true,
});

export const insertMyPriceSchema = createInsertSchema(myPrices).omit({
  id: true,
  created_at: true,
  modified_at: true,
});

export const insertSellInSchema = createInsertSchema(sellIns).omit({
  id: true,
  created_at: true,
});

export const insertSellThroughSchema = createInsertSchema(sellThroughs).omit({
  id: true,
  created_at: true,
});

// Type definitions
export type InsertProduct = z.infer<typeof insertProductSchema>;
export type Product = typeof products.$inferSelect;
export type InsertPriceLevel = z.infer<typeof insertPriceLevelSchema>;
export type PriceLevel = typeof priceLevels.$inferSelect;
export type InsertMyPrice = z.infer<typeof insertMyPriceSchema>;
export type MyPrice = typeof myPrices.$inferSelect;
export type InsertSellIn = z.infer<typeof insertSellInSchema>;
export type SellIn = typeof sellIns.$inferSelect;
export type InsertSellThrough = z.infer<typeof insertSellThroughSchema>;
export type SellThrough = typeof sellThroughs.$inferSelect;

// Distributor and Brand types
export type DistributorRead = typeof distributors.$inferSelect;
export type BrandRead = typeof brands.$inferSelect;

// Analytics types
export type ProductAnalytics = {
  product_id: number;
  product_name: string;
  product_code: string;
  brand_name: string;
  turnover_rate: number;
  total_revenue: number;
  current_stock: number;
};

export type OverallAnalytics = {
  total_products: number;
  active_products: number;
  total_brands: number;
  total_categories: number;
  total_distributors: number;
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

// Legacy types for backward compatibility
export type Distributor = DistributorRead;
export type Brand = BrandRead;

// Product with related data
export type ProductWithPrices = Product & {
  price_levels?: PriceLevel[];
  my_price?: MyPrice | null;
  brand?: BrandRead | null;
  distributor?: DistributorRead | null;
};
