import { OpenAPIHono, createRoute, z } from "@hono/zod-openapi";
import { OrderService } from "./orders.service";
import { createOrderSchema, updateOrderStatusSchema } from "./orders.dto";
import { roleGuard } from "../../middlewares/roleGuard";
import { apiResponse, apiNotFound } from "../../utils/response";

const orders = new OpenAPIHono();

const responseSchema = z.object({
  success: z.boolean(),
  message: z.string().optional(),
  data: z.any().optional(),
});

// --- Create Order (Checkout) ---
const createOrderRoute = createRoute({
  method: 'post',
  path: '/',
  tags: ['Orders'],
  summary: 'Create new order',
  request: {
    body: {
      content: {
        'application/json': {
          schema: createOrderSchema,
        },
      },
    },
  },
  responses: {
    201: {
      content: {
        'application/json': {
          schema: responseSchema,
        },
      },
      description: 'Order created successfully',
    },
    400: {
      content: {
        'application/json': {
          schema: responseSchema,
        },
      },
      description: 'Bad Request (e.g. Insufficient stock)',
    },
  },
});

orders.openapi(createOrderRoute, async (c: any) => {
  const data = c.req.valid("json");
  try {
    const result = await OrderService.createOrder(data);
    return apiResponse(c, 201, "Order created successfully", result);
  } catch (error) {
    if (error instanceof Error && error.message.includes("Insufficient stock")) {
      return apiResponse(c, 400, error.message);
    }
    throw error; // Let global error handler handle 500
  }
});

// --- Get All Orders (KDS View) ---
const getOrdersRoute = createRoute({
  method: 'get',
  path: '/',
  tags: ['Orders'],
  summary: 'Get all orders',
  responses: {
    200: {
      content: {
        'application/json': {
          schema: responseSchema,
        },
      },
      description: 'List of orders',
    },
    404: {
      content: {
        'application/json': {
          schema: responseSchema,
        },
      },
      description: 'Orders not found',
    },
  },
});

orders.openapi(getOrdersRoute, roleGuard(["ADMIN", "SUPERADMIN", "BARISTA"]) as any, async (c: any) => {
  const ordersList = await OrderService.getAllOrders();
  
  if (!ordersList || ordersList.length === 0) {
    return apiNotFound(c, "Data pesanan tidak tersedia");
  }

  return apiResponse(c, 200, "Orders retrieved successfully", ordersList);
});

// --- Update Order Status ---
const updateStatusRoute = createRoute({
  method: 'put',
  path: '/{id}/status',
  tags: ['Orders'],
  summary: 'Update order status',
  request: {
    params: z.object({
      id: z.string(),
    }),
    body: {
      content: {
        'application/json': {
          schema: updateOrderStatusSchema,
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
      description: 'Status updated',
    },
  },
});

orders.openapi(updateStatusRoute, roleGuard(["BARISTA", "ADMIN", "SUPERADMIN"]) as any, async (c: any) => {
  const id = c.req.param("id");
  const data = c.req.valid("json");
  // Mock service call
  return apiResponse(c, 200, "Status updated", { id, status: data.status });
});

export default orders;
