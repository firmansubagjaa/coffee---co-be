import { OpenAPIHono, createRoute, z } from "@hono/zod-openapi";
import { ContentService } from "./content.service";
import { roleGuard } from "../../middlewares/roleGuard";
import { createJobSchema, updateJobSchema, createLocationSchema, updateLocationSchema } from "./content.dto";
import { apiResponse, apiNotFound } from "../../utils/response";

const content = new OpenAPIHono();

const responseSchema = z.object({
  success: z.boolean(),
  message: z.string().optional(),
  data: z.any().optional(),
});

// --- Public: Get Jobs ---
const getJobsRoute = createRoute({
  method: 'get',
  path: '/jobs',
  tags: ['Content'],
  summary: 'Get all job postings',
  responses: {
    200: {
      content: {
        'application/json': {
          schema: responseSchema,
        },
      },
      description: 'List of jobs',
    },
    404: {
      content: {
        'application/json': {
          schema: responseSchema,
        },
      },
      description: 'Jobs not found',
    },
  },
});

content.openapi(getJobsRoute, async (c: any) => {
  const jobs = await ContentService.getJobs(true);
  
  if (!jobs || jobs.length === 0) {
    return apiNotFound(c, "Lowongan pekerjaan tidak tersedia");
  }

  return apiResponse(c, 200, "List of jobs", jobs);
});

// --- Public: Get Locations ---
const getLocationsRoute = createRoute({
  method: 'get',
  path: '/locations',
  tags: ['Content'],
  summary: 'Get all store locations',
  responses: {
    200: {
      content: {
        'application/json': {
          schema: responseSchema,
        },
      },
      description: 'List of locations',
    },
    404: {
      content: {
        'application/json': {
          schema: responseSchema,
        },
      },
      description: 'Locations not found',
    },
  },
});

content.openapi(getLocationsRoute, async (c: any) => {
  const locations = await ContentService.getLocations(true);
  
  if (!locations || locations.length === 0) {
    return apiNotFound(c, "Lokasi toko tidak tersedia");
  }

  return apiResponse(c, 200, "List of locations", locations);
});

// --- Admin: Create Job ---
const createJobRoute = createRoute({
  method: 'post',
  path: '/jobs',
  tags: ['Content'],
  summary: 'Create new job posting',
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

content.openapi(createJobRoute, roleGuard(["ADMIN", "SUPERADMIN"]) as any, async (c: any) => {
  const data = c.req.valid("json");
  try {
    const job = await ContentService.createJob(data);
    return apiResponse(c, 201, "Job created", job);
  } catch (error) {
    return apiResponse(c, 500, "Failed to create job", String(error));
  }
});

// --- Admin: Update Job ---
const updateJobRoute = createRoute({
  method: 'put',
  path: '/jobs/{id}',
  tags: ['Content'],
  summary: 'Update job posting',
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

content.openapi(updateJobRoute, roleGuard(["ADMIN", "SUPERADMIN"]) as any, async (c: any) => {
  const id = c.req.param("id");
  const data = c.req.valid("json");
  const job = await ContentService.updateJob(id, data);
  return apiResponse(c, 200, "Job updated", job);
});

// --- Admin: Delete Job ---
const deleteJobRoute = createRoute({
  method: 'delete',
  path: '/jobs/{id}',
  tags: ['Content'],
  summary: 'Delete job posting',
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

content.openapi(deleteJobRoute, roleGuard(["ADMIN", "SUPERADMIN"]) as any, async (c: any) => {
  const id = c.req.param("id");
  await ContentService.deleteJob(id);
  return apiResponse(c, 200, "Job deleted");
});

// --- Admin: Create Location ---
const createLocationRoute = createRoute({
  method: 'post',
  path: '/locations',
  tags: ['Content'],
  summary: 'Create new store location',
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

content.openapi(createLocationRoute, roleGuard(["ADMIN", "SUPERADMIN"]) as any, async (c: any) => {
  const data = c.req.valid("json");
  try {
    const location = await ContentService.createLocation(data);
    return apiResponse(c, 201, "Location created", location);
  } catch (error) {
    return apiResponse(c, 500, "Failed to create location", String(error));
  }
});

// --- Admin: Update Location ---
const updateLocationRoute = createRoute({
  method: 'put',
  path: '/locations/{id}',
  tags: ['Content'],
  summary: 'Update store location',
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

content.openapi(updateLocationRoute, roleGuard(["ADMIN", "SUPERADMIN"]) as any, async (c: any) => {
  const id = c.req.param("id");
  const data = c.req.valid("json");
  const location = await ContentService.updateLocation(id, data);
  return apiResponse(c, 200, "Location updated", location);
});

// --- Admin: Delete Location ---
const deleteLocationRoute = createRoute({
  method: 'delete',
  path: '/locations/{id}',
  tags: ['Content'],
  summary: 'Delete store location',
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

content.openapi(deleteLocationRoute, roleGuard(["ADMIN", "SUPERADMIN"]) as any, async (c: any) => {
  const id = c.req.param("id");
  await ContentService.deleteLocation(id);
  return apiResponse(c, 200, "Location deleted");
});

export default content;
