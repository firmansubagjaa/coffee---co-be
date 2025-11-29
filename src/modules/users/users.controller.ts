import { OpenAPIHono, createRoute, z } from "@hono/zod-openapi";
import { UsersService } from "./users.service";
import { updateProfileSchema } from "./users.dto";
import { roleGuard } from "../../middlewares/roleGuard";
import { apiResponse, apiNotFound } from "../../utils/response";

const users = new OpenAPIHono();

const responseSchema = z.object({
  success: z.boolean(),
  message: z.string().optional(),
  data: z.any().optional(),
});

// --- Update Own Profile ---
const updateProfileRoute = createRoute({
  method: 'patch',
  path: '/me',
  tags: ['Users'],
  summary: 'Update own profile',
  request: {
    body: {
      content: {
        'application/json': {
          schema: updateProfileSchema,
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
      description: 'Profile updated',
    },
    404: {
      content: {
        'application/json': {
          schema: responseSchema,
        },
      },
      description: 'User not found',
    },
  },
});

users.openapi(updateProfileRoute, roleGuard(["CUSTOMER", "BARISTA", "DATA_ANALYST", "ADMIN", "SUPERADMIN"]) as any, async (c: any) => {
  const user = c.get("user") as any; // Temporary cast
  const data = c.req.valid("json");
  
  const updatedUser = await UsersService.updateProfile(user.sub, data);
  
  if (!updatedUser) {
    return apiNotFound(c as any, "Pengguna tidak ditemukan");
  }

  return apiResponse(c as any, 200, "Profile updated", updatedUser);
});

export default users;
