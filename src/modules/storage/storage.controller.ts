import { OpenAPIHono, createRoute, z } from "@hono/zod-openapi";
import { StorageService } from "./storage.service";
import { roleGuard } from "../../middlewares/roleGuard";
import { apiResponse } from "../../utils/response";

const storage = new OpenAPIHono();

const responseSchema = z.object({
  success: z.boolean(),
  message: z.string().optional(),
  data: z.any().optional(),
});

// --- Product Upload ---
const uploadProductRoute = createRoute({
  method: 'post',
  path: '/upload/products',
  tags: ['Storage'],
  summary: 'Upload product images',
  request: {
    body: {
      content: {
        'multipart/form-data': {
          schema: z.object({
            files: z.union([z.instanceof(File), z.array(z.instanceof(File))]),
          }),
        },
      },
    },
  },
  responses: {
    201: {
      content: { 'application/json': { schema: responseSchema } },
      description: 'Product images uploaded successfully',
    },
  },
});

storage.openapi(uploadProductRoute, roleGuard(["ADMIN", "SUPERADMIN"]) as any, async (c: any) => {
  const body = await c.req.parseBody();
  let files = body['files'];

  if (!files) return apiResponse(c, 400, "No files provided");
  if (!Array.isArray(files)) files = [files as File];

  try {
    const urls = await StorageService.uploadFiles(files as File[], "products");
    return apiResponse(c, 201, "Product images uploaded", { urls, url: urls[0] });
  } catch (error) {
    return apiResponse(c, 500, "Upload failed", String(error));
  }
});

// --- Location Upload ---
const uploadLocationRoute = createRoute({
  method: 'post',
  path: '/upload/locations',
  tags: ['Storage'],
  summary: 'Upload location images',
  request: {
    body: {
      content: {
        'multipart/form-data': {
          schema: z.object({
            files: z.union([z.instanceof(File), z.array(z.instanceof(File))]),
          }),
        },
      },
    },
  },
  responses: {
    201: {
      content: { 'application/json': { schema: responseSchema } },
      description: 'Location images uploaded successfully',
    },
  },
});

storage.openapi(uploadLocationRoute, roleGuard(["ADMIN", "SUPERADMIN"]) as any, async (c: any) => {
  const body = await c.req.parseBody();
  let files = body['files'];

  if (!files) return apiResponse(c, 400, "No files provided");
  if (!Array.isArray(files)) files = [files as File];

  try {
    const urls = await StorageService.uploadFiles(files as File[], "locations");
    return apiResponse(c, 201, "Location images uploaded", { urls, url: urls[0] });
  } catch (error) {
    return apiResponse(c, 500, "Upload failed", String(error));
  }
});

export default storage;
