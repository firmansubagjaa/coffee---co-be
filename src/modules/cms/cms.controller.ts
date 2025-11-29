import { OpenAPIHono, createRoute, z } from "@hono/zod-openapi";
import { CMSService } from "./cms.service";
import { roleGuard } from "../../middlewares/roleGuard";
import { apiResponse } from "../../utils/response";
import { createJobSchema, updateJobSchema, createLocationSchema, updateLocationSchema } from "./cms.dto";

const cms = new OpenAPIHono();

const responseSchema = z.object({
  success: z.boolean(),
  message: z.string().optional(),
  data: z.any().optional(),
});

// --- Public Routes ---

// Get Jobs
const getJobsRoute = createRoute({
  method: 'get',
  path: '/jobs',
  tags: ['CMS'],
  summary: 'Get all active jobs',
  responses: {
    200: {
      content: { 'application/json': { schema: responseSchema } },
      description: 'Jobs retrieved successfully',
    },
  },
});

cms.openapi(getJobsRoute, async (c) => {
  const jobs = await CMSService.getJobs(true);
  return apiResponse(c, 200, "Jobs retrieved", jobs);
});

// Get Locations
const getLocationsRoute = createRoute({
  method: 'get',
  path: '/locations',
  tags: ['CMS'],
  summary: 'Get all locations',
  responses: {
    200: {
      content: { 'application/json': { schema: responseSchema } },
      description: 'Locations retrieved successfully',
    },
  },
});

cms.openapi(getLocationsRoute, async (c) => {
  const locations = await CMSService.getLocations();
  return apiResponse(c, 200, "Locations retrieved", locations);
});

// --- Admin Routes ---

// Create Job
const createJobRoute = createRoute({
  method: 'post',
  path: '/jobs',
  tags: ['CMS'],
  summary: 'Create a new job posting',
  request: {
    body: {
      content: { 'application/json': { schema: createJobSchema } },
    },
  },
  responses: {
    201: {
      content: { 'application/json': { schema: responseSchema } },
      description: 'Job created successfully',
    },
  },
});

cms.openapi(createJobRoute, roleGuard(["ADMIN", "SUPERADMIN"]) as any, async (c: any) => {
  try {
    const data = await c.req.json();
    const job = await CMSService.createJob(data);
    return apiResponse(c, 201, "Job created", job);
  } catch (error) {
    return apiResponse(c, 500, "Failed to create job", String(error));
  }
});

// Update Job
const updateJobRoute = createRoute({
  method: 'put',
  path: '/jobs/{id}',
  tags: ['CMS'],
  summary: 'Update a job posting',
  request: {
    params: z.object({ id: z.string() }),
    body: {
      content: { 'application/json': { schema: updateJobSchema } },
    },
  },
  responses: {
    200: {
      content: { 'application/json': { schema: responseSchema } },
      description: 'Job updated successfully',
    },
  },
});

cms.openapi(updateJobRoute, roleGuard(["ADMIN", "SUPERADMIN"]) as any, async (c: any) => {
  const id = c.req.param("id");
  const data = await c.req.json();
  const job = await CMSService.updateJob(id, data);
  return apiResponse(c, 200, "Job updated", job);
});

// Delete Job
const deleteJobRoute = createRoute({
  method: 'delete',
  path: '/jobs/{id}',
  tags: ['CMS'],
  summary: 'Delete a job posting',
  request: {
    params: z.object({ id: z.string() }),
  },
  responses: {
    200: {
      content: { 'application/json': { schema: responseSchema } },
      description: 'Job deleted successfully',
    },
  },
});

cms.openapi(deleteJobRoute, roleGuard(["ADMIN", "SUPERADMIN"]) as any, async (c: any) => {
  const id = c.req.param("id");
  await CMSService.deleteJob(id);
  return apiResponse(c, 200, "Job deleted");
});

// Create Location
const createLocationRoute = createRoute({
  method: 'post',
  path: '/locations',
  tags: ['CMS'],
  summary: 'Create a new store location',
  request: {
    body: {
      content: { 'application/json': { schema: createLocationSchema } },
    },
  },
  responses: {
    201: {
      content: { 'application/json': { schema: responseSchema } },
      description: 'Location created successfully',
    },
  },
});

cms.openapi(createLocationRoute, roleGuard(["ADMIN", "SUPERADMIN"]) as any, async (c: any) => {
  const data = await c.req.json();
  const location = await CMSService.createLocation(data);
  return apiResponse(c, 201, "Location created", location);
});

// Update Location
const updateLocationRoute = createRoute({
  method: 'put',
  path: '/locations/{id}',
  tags: ['CMS'],
  summary: 'Update a store location',
  request: {
    params: z.object({ id: z.string() }),
    body: {
      content: { 'application/json': { schema: updateLocationSchema } },
    },
  },
  responses: {
    200: {
      content: { 'application/json': { schema: responseSchema } },
      description: 'Location updated successfully',
    },
  },
});

cms.openapi(updateLocationRoute, roleGuard(["ADMIN", "SUPERADMIN"]) as any, async (c: any) => {
  const id = c.req.param("id");
  const data = await c.req.json();
  const location = await CMSService.updateLocation(id, data);
  return apiResponse(c, 200, "Location updated", location);
});

// Delete Location
const deleteLocationRoute = createRoute({
  method: 'delete',
  path: '/locations/{id}',
  tags: ['CMS'],
  summary: 'Delete a store location',
  request: {
    params: z.object({ id: z.string() }),
  },
  responses: {
    200: {
      content: { 'application/json': { schema: responseSchema } },
      description: 'Location deleted successfully',
    },
  },
});

cms.openapi(deleteLocationRoute, roleGuard(["ADMIN", "SUPERADMIN"]) as any, async (c: any) => {
  const id = c.req.param("id");
  await CMSService.deleteLocation(id);
  return apiResponse(c, 200, "Location deleted");
});

export default cms;
