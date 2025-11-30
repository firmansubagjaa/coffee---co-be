import { OpenAPIHono, createRoute, z } from "@hono/zod-openapi";
import { prisma } from "../../utils/prisma";
import { apiResponse } from "../../utils/response";

const health = new OpenAPIHono();

const healthSchema = z.object({
  status: z.string(),
  database: z.string(),
  uptime: z.number(),
});

const healthRoute = createRoute({
  method: 'get',
  path: '/health',
  tags: ['Health'],
  summary: 'Check system health',
  responses: {
    200: {
      content: {
        'application/json': {
          schema: z.object({
            success: z.boolean(),
            message: z.string(),
            data: healthSchema,
          }),
        },
      },
      description: 'System is healthy',
    },
    503: {
      content: {
        'application/json': {
          schema: z.object({
            success: z.boolean(),
            message: z.string(),
            data: z.object({
              status: z.string(),
              database: z.string(),
            }),
          }),
        },
      },
      description: 'System is unhealthy',
    },
  },
});

health.openapi(healthRoute, async (c: any) => {
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
