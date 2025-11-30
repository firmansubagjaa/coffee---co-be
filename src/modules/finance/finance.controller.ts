import { OpenAPIHono, createRoute, z } from "@hono/zod-openapi";
import { FinanceService } from "./finance.service";
import { roleGuard } from "../../middlewares/roleGuard";
import { apiResponse, apiNotFound } from "../../utils/response";

const finance = new OpenAPIHono();

const responseSchema = z.object({
  success: z.boolean(),
  message: z.string().optional(),
  data: z.any().optional(),
});

// --- Get Alerts ---
const getAlertsRoute = createRoute({
  method: 'get',
  path: '/alerts',
  tags: ['Finance'],
  summary: 'Get financial alerts',
  responses: {
    200: {
      content: {
        'application/json': {
          schema: responseSchema,
        },
      },
      description: 'List of alerts',
    },
    404: {
      content: {
        'application/json': {
          schema: responseSchema,
        },
      },
      description: 'Alerts not found',
    },
  },
});

finance.openapi(getAlertsRoute, roleGuard(["ADMIN", "SUPERADMIN"]) as any, async (c: any) => {
  const alerts = await FinanceService.getAlerts();
  
  if (!alerts || alerts.length === 0) {
    return apiNotFound(c, "Tidak ada peringatan");
  }

  return apiResponse(c, 200, "List of alerts", alerts);
});

// --- Get PnL ---
const getPnLRoute = createRoute({
  method: 'get',
  path: '/pnl',
  tags: ['Finance'],
  summary: 'Get P&L statement',
  responses: {
    200: {
      content: {
        'application/json': {
          schema: responseSchema,
        },
      },
      description: 'P&L Statement',
    },
  },
});

finance.openapi(getPnLRoute, roleGuard(["ADMIN", "SUPERADMIN", "DATA_ANALYST"]) as any, async (c: any) => {
  const pnl = await FinanceService.getPnL();
  return apiResponse(c, 200, "P&L Statement", pnl);
});

export default finance;
