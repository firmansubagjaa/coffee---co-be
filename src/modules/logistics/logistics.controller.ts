import { OpenAPIHono, createRoute, z } from "@hono/zod-openapi";
import { LogisticsService } from "./logistics.service";
import { roleGuard } from "../../middlewares/roleGuard";
import { apiResponse, apiNotFound } from "../../utils/response";

const logistics = new OpenAPIHono();

const responseSchema = z.object({
  success: z.boolean(),
  message: z.string().optional(),
  data: z.any().optional(),
});

const listStationsRoute = createRoute({
  method: 'get',
  path: '/',
  tags: ['Logistics'],
  summary: 'Get all IoT stations',
  responses: {
    200: {
      content: {
        'application/json': {
          schema: responseSchema,
        },
      },
      description: 'List of stations',
    },
    404: {
      content: {
        'application/json': {
          schema: responseSchema,
        },
      },
      description: 'Stations not found',
    },
  },
});

logistics.openapi(listStationsRoute, async (c: any) => {
  const stations = await LogisticsService.getAllStations();
  
  if (!stations || stations.length === 0) {
    return apiNotFound(c, "Data stasiun tidak tersedia");
  }

  return apiResponse(c, 200, "List of stations", stations);
});

const createStationRoute = createRoute({
  method: 'post',
  path: '/',
  tags: ['Logistics'],
  summary: 'Add new station',
  request: {
    body: {
      content: {
        'application/json': {
          schema: z.object({
            name: z.string(),
            category: z.string(),
            status: z.enum(["ok", "low", "critical"]).default("ok"),
          }),
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
      description: 'Station created',
    },
  },
});

logistics.openapi(createStationRoute, roleGuard(["ADMIN", "SUPERADMIN"]) as any, async (c: any) => {
  const data = c.req.valid("json");
  const station = await LogisticsService.createStation(data);
  return apiResponse(c, 201, "Station created", station);
});

const updateStationRoute = createRoute({
  method: 'patch',
  path: '/{id}',
  tags: ['Logistics'],
  summary: 'Update station status',
  request: {
    params: z.object({
      id: z.string(),
    }),
    body: {
      content: {
        'application/json': {
          schema: z.object({
            status: z.enum(["ok", "low", "critical"]),
            metricValue: z.string().optional(),
            unit: z.string().optional(),
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
      description: 'Station updated',
    },
  },
});

logistics.openapi(updateStationRoute, roleGuard(["ADMIN", "SUPERADMIN"]) as any, async (c: any) => {
  const id = c.req.param("id");
  const data = c.req.valid("json");
  const station = await LogisticsService.updateStationStatus(id, data.status, data.metricValue, data.unit);
  return apiResponse(c, 200, "Station updated", station);
});

export default logistics;
