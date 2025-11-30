import { z } from "@hono/zod-openapi";

// Variant Schema
export const variantSchema = z.object({
  id: z.string().optional().openapi({ example: "variant-123" }),
  name: z.string().min(1).openapi({ example: "Large" }),
  sku: z.string().optional().openapi({ example: "SKU-123" }),
  price: z.number().min(0).openapi({ example: 50000 }),
  stock: z.number().int().min(0).openapi({ example: 100 }),
});

// Create Product Schema
export const createProductSchema = z.object({
  name: z.string().min(3).openapi({ example: "Kopi Gayo" }),
  description: z.string().min(10).openapi({ example: "Authentic Gayo Coffee..." }),
  category: z.enum(["COFFEE", "PASTRY", "MERCH", "FOOD"]).openapi({ example: "COFFEE" }),
  price: z.number().min(0).openapi({ example: 45000 }),
  image: z.string().url().openapi({ example: "https://example.com/image.jpg" }),
  images: z.array(z.string().url()).default([]).openapi({ example: ["https://example.com/img1.jpg"] }),
  subDescriptions: z.array(z.string()).default([]).openapi({ example: ["Strong Body", "Fruity"] }),
  origin: z.string().optional().openapi({ example: "Aceh" }),
  roastLevel: z.string().optional().openapi({ example: "Medium Dark" }),
  tastingNotes: z.array(z.string()).default([]).openapi({ example: ["Chocolate", "Spicy"] }),
  sizes: z.array(z.string()).default([]).openapi({ example: ["S", "M", "L"] }),
  grindOptions: z.array(z.string()).default([]).openapi({ example: ["Whole Bean", "Espresso"] }),
  variants: z.array(variantSchema).min(1, "At least one variant is required"),
});

// Update Product Schema (Partial)
export const updateProductSchema = createProductSchema.partial();

export type CreateProductDTO = z.infer<typeof createProductSchema>;
export type UpdateProductDTO = z.infer<typeof updateProductSchema>;
