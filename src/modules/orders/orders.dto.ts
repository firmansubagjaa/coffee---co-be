import { z } from "@hono/zod-openapi";

export const createOrderSchema = z.object({
  userId: z.string().uuid("Invalid User ID").openapi({ example: "user-123" }), // In real app, this might come from token
  items: z.array(
    z.object({
      variantId: z.string().uuid("Invalid Variant ID").openapi({ example: "variant-123" }),
      quantity: z.number().int().min(1, "Quantity must be at least 1").openapi({ example: 2 }),
    })
  ).min(1, "Order must contain at least one item"),
});

export const updateOrderStatusSchema = z.object({
  status: z.enum(["PENDING", "PREPARING", "READY", "DELIVERED", "CANCELLED"]).openapi({ example: "READY" }),
});

export type CreateOrderDTO = z.infer<typeof createOrderSchema>;
export type UpdateOrderStatusDTO = z.infer<typeof updateOrderStatusSchema>;
