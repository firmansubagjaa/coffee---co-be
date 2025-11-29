import { z } from "@hono/zod-openapi";

export const createStationSchema = z.object({
  name: z.string().openapi({ example: "Espresso Machine 1" }),
  category: z.string().openapi({ example: "machine" }),
  status: z.string().openapi({ example: "ok" }),
  metricValue: z.string().optional().openapi({ example: "93.5" }),
  unit: z.string().optional().openapi({ example: "°C" }),
});

export const updateStationSchema = z.object({
  status: z.string().optional().openapi({ example: "maintenance" }),
  metricValue: z.string().optional().openapi({ example: "0" }),
  unit: z.string().optional().openapi({ example: "°C" }),
});

export type CreateStationDTO = z.infer<typeof createStationSchema>;
export type UpdateStationDTO = z.infer<typeof updateStationSchema>;
