import { z } from "@hono/zod-openapi";

export const webhookSchema = z.object({
  orderId: z.string().uuid().openapi({ example: "order-123" }),
  status: z.enum(["PAID", "FAILED", "EXPIRED"]).openapi({ example: "PAID" }),
  transactionId: z.string().optional().openapi({ example: "txn_12345" }),
  signature: z.string().optional().openapi({ example: "sha256_signature" }),
});

export type WebhookDTO = z.infer<typeof webhookSchema>;
