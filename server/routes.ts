import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertProductSchema, insertSellInSchema, insertSellThroughSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Product routes
  app.get("/api/products", async (req, res) => {
    try {
      const products = await storage.getProducts();
      res.json(products);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch products" });
    }
  });

  app.get("/api/products/search", async (req, res) => {
    try {
      const query = req.query.q as string;
      if (!query || query.length < 2) {
        return res.json([]);
      }
      const products = await storage.searchProducts(query);
      res.json(products);
    } catch (error) {
      res.status(500).json({ message: "Failed to search products" });
    }
  });

  app.get("/api/products/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const product = await storage.getProduct(id);
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      res.json(product);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch product" });
    }
  });

  app.post("/api/products", async (req, res) => {
    try {
      const validatedData = insertProductSchema.parse(req.body);
      
      // Check if product code already exists
      const existingProduct = await storage.getProductByCode(validatedData.product_code);
      if (existingProduct) {
        return res.status(400).json({ message: "Product code already exists" });
      }

      const product = await storage.createProduct(validatedData);
      res.status(201).json(product);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create product" });
    }
  });

  app.put("/api/products/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertProductSchema.partial().parse(req.body);
      
      const product = await storage.updateProduct(id, validatedData);
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      res.json(product);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update product" });
    }
  });

  app.delete("/api/products/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteProduct(id);
      if (!deleted) {
        return res.status(404).json({ message: "Product not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete product" });
    }
  });

  // Bulk upload endpoint
  app.post("/api/products/bulk", async (req, res) => {
    try {
      const products = req.body;
      if (!Array.isArray(products)) {
        return res.status(400).json({ message: "Expected array of products" });
      }

      const results = [];
      const errors = [];

      for (let i = 0; i < products.length; i++) {
        try {
          const validatedData = insertProductSchema.parse(products[i]);
          const existingProduct = await storage.getProductByCode(validatedData.product_code);
          
          if (existingProduct) {
            errors.push({ row: i + 1, error: "Product code already exists" });
            continue;
          }

          const product = await storage.createProduct(validatedData);
          results.push(product);
        } catch (error) {
          if (error instanceof z.ZodError) {
            errors.push({ row: i + 1, error: "Validation error", details: error.errors });
          } else {
            errors.push({ row: i + 1, error: "Failed to create product" });
          }
        }
      }

      res.json({
        success: results.length,
        errors: errors.length,
        created: results,
        failed: errors,
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to process bulk upload" });
    }
  });

  // Sell-in routes
  app.get("/api/sell-ins", async (req, res) => {
    try {
      const productId = req.query.product_id ? parseInt(req.query.product_id as string) : undefined;
      const monthPartition = req.query.month as string;
      const sellIns = await storage.getSellIns(productId, monthPartition);
      res.json(sellIns);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch sell-ins" });
    }
  });

  app.post("/api/sell-ins", async (req, res) => {
    try {
      const validatedData = insertSellInSchema.parse(req.body);
      const sellIn = await storage.createSellIn(validatedData);
      res.status(201).json(sellIn);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create sell-in" });
    }
  });

  // Sell-through routes
  app.get("/api/sell-throughs", async (req, res) => {
    try {
      const productId = req.query.product_id ? parseInt(req.query.product_id as string) : undefined;
      const monthPartition = req.query.month as string;
      const sellThroughs = await storage.getSellThroughs(productId, monthPartition);
      res.json(sellThroughs);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch sell-throughs" });
    }
  });

  app.post("/api/sell-throughs", async (req, res) => {
    try {
      const validatedData = insertSellThroughSchema.parse(req.body);
      const sellThrough = await storage.createSellThrough(validatedData);
      res.status(201).json(sellThrough);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create sell-through" });
    }
  });

  // Analytics routes
  app.get("/api/analytics/products", async (req, res) => {
    try {
      const productId = req.query.product_id ? parseInt(req.query.product_id as string) : undefined;
      const monthPartition = req.query.month as string;
      const analytics = await storage.getProductAnalytics(productId, monthPartition);
      res.json(analytics);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch product analytics" });
    }
  });

  app.get("/api/analytics/overall", async (req, res) => {
    try {
      const monthPartition = req.query.month as string;
      const analytics = await storage.getOverallAnalytics(monthPartition);
      res.json(analytics);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch overall analytics" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
