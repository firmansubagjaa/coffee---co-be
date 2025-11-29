import { OpenAPIHono, createRoute, z } from "@hono/zod-openapi";
import { prisma } from "../../utils/prisma";
import { apiResponse } from "../../utils/response";

const health = new OpenAPIHono();

const responseSchema = z.object({
  success: z.boolean(),
  message: z.string().optional(),
  data: z.any().optional(),
});

const healthCheckRoute = createRoute({
  method: 'get',
  path: '/health',
  tags: ['Health'],
  summary: 'Health Check',
  responses: {
    200: {
      content: {
        'application/json': {
          schema: responseSchema,
        },
      },
      description: 'System Status',
    },
    503: {
      content: {
        'application/json': {
          schema: responseSchema,
        },
      },
      description: 'System Unhealthy',
    },
  },
});

health.openapi(healthCheckRoute, async (c) => {
  let dbStatus = "disconnected";
  try {
    await prisma.$queryRaw`SELECT 1`;
    dbStatus = "connected";
  } catch (e) {
    dbStatus = "error";
    return apiResponse(c, 503, "System Unhealthy", { status: "unhealthy", database: dbStatus });
  }

  return apiResponse(c, 200, "System Status", {
    status: "ok",
    database: dbStatus,
    uptime: process.uptime(),
  });
});

export default health;
