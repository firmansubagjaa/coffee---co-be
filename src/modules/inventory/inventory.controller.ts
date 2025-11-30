import { OpenAPIHono, createRoute, z } from "@hono/zod-openapi";
import { InventoryService } from "./inventory.service";
import { roleGuard } from "../../middlewares/roleGuard";
import { apiResponse, apiNotFound } from "../../utils/response";

const inventory = new OpenAPIHono();

const responseSchema = z.object({
  success: z.boolean(),
  message: z.string().optional(),
  data: z.any().optional(),
});

// --- Restock Variant ---
const restockRoute = createRoute({
  method: 'post',
  path: '/restock',
  tags: ['Inventory'],
  summary: 'Restock product variant',
  request: {
    body: {
      content: {
        'application/json': {
          schema: z.object({
            variantId: z.string(),
            amount: z.number().int().positive(),
          }),
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
      description: 'Stock updated',
    },
  },
});

inventory.openapi(restockRoute, roleGuard(["ADMIN", "SUPERADMIN", "BARISTA"]) as any, async (c: any) => {
  const { variantId, amount } = c.req.valid("json");
  const updatedVariant = await InventoryService.restockVariant(variantId, amount);
  return apiResponse(c, 200, "Stock updated", updatedVariant);
});

// --- Low Stock ---
const lowStockRoute = createRoute({
  method: 'get',
  path: '/low-stock',
  tags: ['Inventory'],
  summary: 'Get low stock items',
  responses: {
    200: {
      content: {
        'application/json': {
          schema: responseSchema,
        },
      },
      description: 'Low stock items',
    },
    404: {
      content: {
        'application/json': {
          schema: responseSchema,
        },
      },
      description: 'No low stock items',
    },
  },
});

inventory.openapi(lowStockRoute, roleGuard(["ADMIN", "SUPERADMIN", "BARISTA"]) as any, async (c: any) => {
  const items = await InventoryService.getLowStockVariants();
  
  if (!items || items.length === 0) {
    return apiNotFound(c, "Tidak ada stok menipis");
  }

  return apiResponse(c, 200, "List of low stock items", items);
});

export default inventory;
