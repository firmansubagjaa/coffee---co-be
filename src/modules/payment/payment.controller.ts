import { OpenAPIHono, createRoute, z } from "@hono/zod-openapi";
import { PaymentService } from "./payment.service";
import { webhookSchema } from "./payment.dto";
import { apiResponse } from "../../utils/response";

const payment = new OpenAPIHono();

const responseSchema = z.object({
  success: z.boolean(),
  message: z.string().optional(),
  data: z.any().optional(),
});

// --- Webhook ---
const webhookRoute = createRoute({
  method: 'post',
  path: '/webhook',
  tags: ['Payment'],
  summary: 'Payment gateway webhook',
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

payment.openapi(webhookRoute, async (c: any) => {
  const data = c.req.valid("json");
  await PaymentService.handleWebhook(data);
  return apiResponse(c, 200, "Webhook processed");
});

export default payment;
