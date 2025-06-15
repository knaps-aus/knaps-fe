import { products, sellIns, sellThroughs, type Product, type InsertProduct, type SellIn, type InsertSellIn, type SellThrough, type InsertSellThrough, type ProductAnalytics, type OverallAnalytics } from "@shared/schema";

export interface IStorage {
  // Product operations
  getProducts(): Promise<Product[]>;
  getProduct(id: number): Promise<Product | undefined>;
  getProductByCode(code: string): Promise<Product | undefined>;
  searchProducts(query: string): Promise<Product[]>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: number, product: Partial<InsertProduct>): Promise<Product | undefined>;
  deleteProduct(id: number): Promise<boolean>;
  
  // Sell-in operations
  getSellIns(productId?: number, monthPartition?: string): Promise<SellIn[]>;
  createSellIn(sellIn: InsertSellIn): Promise<SellIn>;
  
  // Sell-through operations
  getSellThroughs(productId?: number, monthPartition?: string): Promise<SellThrough[]>;
  createSellThrough(sellThrough: InsertSellThrough): Promise<SellThrough>;
  
  // Analytics operations
  getProductAnalytics(productId?: number, monthPartition?: string): Promise<ProductAnalytics[]>;
  getOverallAnalytics(monthPartition?: string): Promise<OverallAnalytics>;
}

export class MemStorage implements IStorage {
  private products: Map<number, Product>;
  private sellIns: Map<number, SellIn>;
  private sellThroughs: Map<number, SellThrough>;
  private currentProductId: number;
  private currentSellInId: number;
  private currentSellThroughId: number;

  constructor() {
    this.products = new Map();
    this.sellIns = new Map();
    this.sellThroughs = new Map();
    this.currentProductId = 1;
    this.currentSellInId = 1;
    this.currentSellThroughId = 1;
  }

  async getProducts(): Promise<Product[]> {
    return Array.from(this.products.values());
  }

  async getProduct(id: number): Promise<Product | undefined> {
    return this.products.get(id);
  }

  async getProductByCode(code: string): Promise<Product | undefined> {
    return Array.from(this.products.values()).find(
      (product) => product.product_code === code
    );
  }

  async searchProducts(query: string): Promise<Product[]> {
    const lowercaseQuery = query.toLowerCase();
    return Array.from(this.products.values()).filter(
      (product) =>
        product.product_name.toLowerCase().includes(lowercaseQuery) ||
        product.product_code.toLowerCase().includes(lowercaseQuery) ||
        product.brand_name.toLowerCase().includes(lowercaseQuery) ||
        product.category_name.toLowerCase().includes(lowercaseQuery)
    );
  }

  async createProduct(insertProduct: InsertProduct): Promise<Product> {
    const id = this.currentProductId++;
    const now = new Date();
    const product: Product = {
      ...insertProduct,
      id,
      created_at: now,
      updated_at: now,
    };
    this.products.set(id, product);
    return product;
  }

  async updateProduct(id: number, updateData: Partial<InsertProduct>): Promise<Product | undefined> {
    const existingProduct = this.products.get(id);
    if (!existingProduct) {
      return undefined;
    }

    const updatedProduct: Product = {
      ...existingProduct,
      ...updateData,
      updated_at: new Date(),
    };
    this.products.set(id, updatedProduct);
    return updatedProduct;
  }

  async deleteProduct(id: number): Promise<boolean> {
    return this.products.delete(id);
  }

  async getSellIns(productId?: number, monthPartition?: string): Promise<SellIn[]> {
    let sellIns = Array.from(this.sellIns.values());
    
    if (productId) {
      sellIns = sellIns.filter(si => si.product_id === productId);
    }
    
    if (monthPartition) {
      sellIns = sellIns.filter(si => si.month_partition === monthPartition);
    }
    
    return sellIns;
  }

  async createSellIn(insertSellIn: InsertSellIn): Promise<SellIn> {
    const id = this.currentSellInId++;
    const sellIn: SellIn = {
      ...insertSellIn,
      id,
      created_at: new Date(),
    };
    this.sellIns.set(id, sellIn);
    return sellIn;
  }

  async getSellThroughs(productId?: number, monthPartition?: string): Promise<SellThrough[]> {
    let sellThroughs = Array.from(this.sellThroughs.values());
    
    if (productId) {
      sellThroughs = sellThroughs.filter(st => st.product_id === productId);
    }
    
    if (monthPartition) {
      sellThroughs = sellThroughs.filter(st => st.month_partition === monthPartition);
    }
    
    return sellThroughs;
  }

  async createSellThrough(insertSellThrough: InsertSellThrough): Promise<SellThrough> {
    const id = this.currentSellThroughId++;
    const sellThrough: SellThrough = {
      ...insertSellThrough,
      id,
      created_at: new Date(),
    };
    this.sellThroughs.set(id, sellThrough);
    return sellThrough;
  }

  async getProductAnalytics(productId?: number, monthPartition?: string): Promise<ProductAnalytics[]> {
    const products = productId 
      ? [this.products.get(productId)].filter(Boolean) as Product[]
      : Array.from(this.products.values());

    const analytics: ProductAnalytics[] = [];

    for (const product of products) {
      const sellIns = await this.getSellIns(product.id, monthPartition);
      const sellThroughs = await this.getSellThroughs(product.id, monthPartition);

      const sellInQuantity = sellIns.reduce((sum, si) => sum + si.quantity, 0);
      const sellThroughQuantity = sellThroughs.reduce((sum, st) => sum + st.quantity, 0);
      const totalRevenue = sellThroughs.reduce((sum, st) => sum + parseFloat(st.total_revenue || '0'), 0);
      const currentStock = sellInQuantity - sellThroughQuantity;
      const turnoverRate = sellInQuantity > 0 ? (sellThroughQuantity / sellInQuantity) * 100 : 0;

      analytics.push({
        product_id: product.id,
        product_name: product.product_name,
        product_code: product.product_code,
        brand_name: product.brand_name,
        sell_in_quantity: sellInQuantity,
        sell_through_quantity: sellThroughQuantity,
        turnover_rate: Math.round(turnoverRate * 10) / 10,
        total_revenue: totalRevenue,
        current_stock: currentStock,
      });
    }

    return analytics.sort((a, b) => b.total_revenue - a.total_revenue);
  }

  async getOverallAnalytics(monthPartition?: string): Promise<OverallAnalytics> {
    const sellIns = await this.getSellIns(undefined, monthPartition);
    const sellThroughs = await this.getSellThroughs(undefined, monthPartition);

    const totalSellIn = sellIns.reduce((sum, si) => sum + si.quantity, 0);
    const totalSellThrough = sellThroughs.reduce((sum, st) => sum + st.quantity, 0);
    const totalRevenue = sellThroughs.reduce((sum, st) => sum + parseFloat(st.total_revenue || '0'), 0);
    const averageTurnoverRate = totalSellIn > 0 ? (totalSellThrough / totalSellIn) * 100 : 0;

    return {
      total_sell_in: totalSellIn,
      total_sell_through: totalSellThrough,
      average_turnover_rate: Math.round(averageTurnoverRate * 10) / 10,
      total_revenue: totalRevenue,
    };
  }
}

export const storage = new MemStorage();
