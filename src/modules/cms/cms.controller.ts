import { OpenAPIHono, createRoute, z } from "@hono/zod-openapi";
import { CMSService } from "./cms.service";
import { createJobSchema, updateJobSchema, createLocationSchema, updateLocationSchema } from "./cms.dto";
import { roleGuard } from "../../middlewares/roleGuard";
import { apiResponse, apiNotFound } from "../../utils/response";

const cms = new OpenAPIHono();

const responseSchema = z.object({
  success: z.boolean(),
  message: z.string().optional(),
  data: z.any().optional(),
});

// --- Jobs ---
const listJobsRoute = createRoute({
  method: 'get',
  path: '/jobs',
  tags: ['CMS'],
  summary: 'List all jobs',
  responses: {
    200: {
      content: {
        'application/json': {
          schema: responseSchema,
        },
      },
      description: 'List of jobs',
    },
  },
});

cms.openapi(listJobsRoute, async (c: any) => {
  const jobs = await CMSService.getJobs();
  return apiResponse(c, 200, "Jobs retrieved", jobs);
});

const createJobRoute = createRoute({
  method: 'post',
  path: '/jobs',
  tags: ['CMS'],
  summary: 'Create new job',
  request: {
    body: {
      content: {
        'application/json': {
          schema: createJobSchema,
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
      description: 'Job created',
    },
  },
});

cms.openapi(createJobRoute, roleGuard(["ADMIN", "SUPERADMIN"]) as any, async (c: any) => {
  const data = c.req.valid("json");
  const job = await CMSService.createJob(data);
  return apiResponse(c, 201, "Job created", job);
});

const updateJobRoute = createRoute({
  method: 'put',
  path: '/jobs/{id}',
  tags: ['CMS'],
  summary: 'Update job',
  request: {
    params: z.object({
      id: z.string(),
    }),
    body: {
      content: {
        'application/json': {
          schema: updateJobSchema,
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
      description: 'Job updated',
    },
  },
});

cms.openapi(updateJobRoute, roleGuard(["ADMIN", "SUPERADMIN"]) as any, async (c: any) => {
  const id = c.req.param("id");
  const data = c.req.valid("json");
  const job = await CMSService.updateJob(id, data);
  return apiResponse(c, 200, "Job updated", job);
});

const deleteJobRoute = createRoute({
  method: 'delete',
  path: '/jobs/{id}',
  tags: ['CMS'],
  summary: 'Delete job',
  request: {
    params: z.object({
      id: z.string(),
    }),
  },
  responses: {
    200: {
      content: {
        'application/json': {
          schema: responseSchema,
        },
      },
      description: 'Job deleted',
    },
  },
});

cms.openapi(deleteJobRoute, roleGuard(["ADMIN", "SUPERADMIN"]) as any, async (c: any) => {
  const id = c.req.param("id");
  await CMSService.deleteJob(id);
  return apiResponse(c, 200, "Job deleted");
});

// --- Locations ---
const listLocationsRoute = createRoute({
  method: 'get',
  path: '/locations',
  tags: ['CMS'],
  summary: 'List all locations',
  responses: {
    200: {
      content: {
        'application/json': {
          schema: responseSchema,
        },
      },
      description: 'List of locations',
    },
  },
});

cms.openapi(listLocationsRoute, async (c: any) => {
  const locations = await CMSService.getLocations();
  return apiResponse(c, 200, "Locations retrieved", locations);
});

const createLocationRoute = createRoute({
  method: 'post',
  path: '/locations',
  tags: ['CMS'],
  summary: 'Create new location',
  request: {
    body: {
      content: {
        'application/json': {
          schema: createLocationSchema,
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
      description: 'Location created',
    },
  },
});

cms.openapi(createLocationRoute, roleGuard(["ADMIN", "SUPERADMIN"]) as any, async (c: any) => {
  const data = c.req.valid("json");
  const location = await CMSService.createLocation(data);
  return apiResponse(c, 201, "Location created", location);
});

const updateLocationRoute = createRoute({
  method: 'put',
  path: '/locations/{id}',
  tags: ['CMS'],
  summary: 'Update location',
  request: {
    params: z.object({
      id: z.string(),
    }),
    body: {
      content: {
        'application/json': {
          schema: updateLocationSchema,
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
      description: 'Location updated',
    },
  },
});

cms.openapi(updateLocationRoute, roleGuard(["ADMIN", "SUPERADMIN"]) as any, async (c: any) => {
  const id = c.req.param("id");
  const data = c.req.valid("json");
  const location = await CMSService.updateLocation(id, data);
  return apiResponse(c, 200, "Location updated", location);
});

const deleteLocationRoute = createRoute({
  method: 'delete',
  path: '/locations/{id}',
  tags: ['CMS'],
  summary: 'Delete location',
  request: {
    params: z.object({
      id: z.string(),
    }),
  },
  responses: {
    200: {
      content: {
        'application/json': {
          schema: responseSchema,
        },
      },
      description: 'Location deleted',
    },
  },
});

cms.openapi(deleteLocationRoute, roleGuard(["ADMIN", "SUPERADMIN"]) as any, async (c: any) => {
  const id = c.req.param("id");
  await CMSService.deleteLocation(id);
  return apiResponse(c, 200, "Location deleted");
});

export default cms;
