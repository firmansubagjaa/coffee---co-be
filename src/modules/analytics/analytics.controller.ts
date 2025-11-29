import { OpenAPIHono, createRoute, z } from "@hono/zod-openapi";
import { AnalyticsService } from "./analytics.service";
import { BIService } from "./bi.service";
import { roleGuard } from "../../middlewares/roleGuard";
import { apiResponse, apiNotFound } from "../../utils/response";

const analytics = new OpenAPIHono();

const responseSchema = z.object({
  success: z.boolean(),
  message: z.string().optional(),
  data: z.any().optional(),
});

// --- Revenue Stats ---
const revenueRoute = createRoute({
  method: 'get',
  path: '/revenue',
  tags: ['Analytics'],
  summary: 'Get revenue stats',
  responses: {
    200: {
      content: {
        'application/json': {
          schema: responseSchema,
        },
      },
      description: 'Revenue stats',
    },
    404: {
      content: {
        'application/json': {
          schema: responseSchema,
        },
      },
      description: 'Stats not found',
    },
  },
});

analytics.openapi(revenueRoute, roleGuard(["ADMIN", "SUPERADMIN"]) as any, async (c: any) => {
  const result = await AnalyticsService.getRevenueStats();
  if (!result || result.length === 0) return apiNotFound(c, "Data pendapatan tidak tersedia");
  return apiResponse(c, 200, "Revenue stats retrieved successfully", result);
});

// --- Top Products ---
const topProductsRoute = createRoute({
  method: 'get',
  path: '/top-products',
  tags: ['Analytics'],
  summary: 'Get top selling products',
  responses: {
    200: {
      content: {
        'application/json': {
          schema: responseSchema,
        },
      },
      description: 'Top products',
    },
    404: {
      content: {
        'application/json': {
          schema: responseSchema,
        },
      },
      description: 'Top products not found',
    },
  },
});

analytics.openapi(topProductsRoute, roleGuard(["ADMIN", "SUPERADMIN"]) as any, async (c: any) => {
  const result = await AnalyticsService.getTopProducts();
  if (!result || result.length === 0) return apiNotFound(c, "Data produk terlaris tidak tersedia");
  return apiResponse(c, 200, "Top products retrieved successfully", result);
});

// --- BI: Churn Risk ---
const churnRiskRoute = createRoute({
  method: 'get',
  path: '/bi/churn-risk',
  tags: ['Analytics'],
  summary: 'Get churn risk analysis',
  responses: {
    200: {
      content: {
        'application/json': {
          schema: responseSchema,
        },
      },
      description: 'Churn risk data',
    },
    404: {
      content: {
        'application/json': {
          schema: responseSchema,
        },
      },
      description: 'Churn risk data not found',
    },
  },
});

analytics.openapi(churnRiskRoute, roleGuard(["ADMIN", "SUPERADMIN", "DATA_ANALYST"]) as any, async (c: any) => {
  const data = await BIService.getChurnRisk();
  if (!data || data.length === 0) return apiNotFound(c, "Analisis churn risk tidak tersedia");
  return apiResponse(c, 200, "Churn risk data", data);
});

// --- BI: Forecast ---
const forecastRoute = createRoute({
  method: 'get',
  path: '/bi/forecast',
  tags: ['Analytics'],
  summary: 'Get sales forecast',
  responses: {
    200: {
      content: {
        'application/json': {
          schema: responseSchema,
        },
      },
      description: 'Forecast data',
    },
    404: {
      content: {
        'application/json': {
          schema: responseSchema,
        },
      },
      description: 'Forecast data not found',
    },
  },
});

analytics.openapi(forecastRoute, roleGuard(["ADMIN", "SUPERADMIN", "DATA_ANALYST"]) as any, async (c: any) => {
  const data = await BIService.getForecast();
  if (!data) return apiNotFound(c, "Data forecast tidak tersedia");
  return apiResponse(c, 200, "Forecast data", data);
});

export default analytics;
