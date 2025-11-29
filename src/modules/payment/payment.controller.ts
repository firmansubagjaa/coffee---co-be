import { OpenAPIHono, createRoute, z } from "@hono/zod-openapi";
import { webhookSchema } from "./payment.dto";
import { apiResponse } from "../../utils/response";

const payment = new OpenAPIHono();

const responseSchema = z.object({
  success: z.boolean(),
  message: z.string().optional(),
  data: z.any().optional(),
});

// --- Webhook Notification ---
const webhookRoute = createRoute({
  method: 'post',
  path: '/webhook',
  tags: ['Payment'],
  summary: 'Payment Gateway Webhook',
  request: {
    body: {
      content: {
        'application/json': {
          schema: webhookSchema,
        },
      },
    },
  },
  responses: {
    200: {
      content: {
        'application/json': {
          schema: responseSchema,
        },
      },
      description: 'Webhook processed',
    },
  },
});

payment.openapi(webhookRoute, async (c) => {
  const data = c.req.valid("json");
  // Logic to update order status based on payment
  console.log("Payment Webhook Received:", data);
  return apiResponse(c, 200, "Webhook processed");
});

export default payment;
