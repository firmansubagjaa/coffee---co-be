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

// --- Upload File ---
const uploadFileRoute = createRoute({
  method: 'post',
  path: '/upload',
  tags: ['Storage'],
  summary: 'Upload file to storage',
  request: {
    body: {
      content: {
        'multipart/form-data': {
          schema: z.object({
            file: z.instanceof(File).openapi({ type: 'string', format: 'binary' }),
            folder: z.string().optional().default('uploads'),
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
      description: 'File uploaded',
    },
  },
});

storage.openapi(uploadFileRoute, roleGuard(["ADMIN", "SUPERADMIN", "BARISTA"]) as any, async (c: any) => {
  const body = await c.req.parseBody();
  const file = body['file'];
  const folder = body['folder'] as string;

  if (!file || !(file instanceof File)) {
    return apiResponse(c, 400, "No file uploaded");
  }

  const url = await StorageService.uploadFile(file, folder);
  return apiResponse(c, 201, "File uploaded successfully", { url });
});

export default storage;
