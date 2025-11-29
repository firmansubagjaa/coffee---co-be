import { OpenAPIHono, createRoute, z } from "@hono/zod-openapi";
import { AdminService } from "./admin.service";
import { roleGuard } from "../../middlewares/roleGuard";
import { Role } from "../../../generated/prisma/client";
import { updateRoleSchema } from "./admin.dto";
import { apiResponse, apiNotFound } from "../../utils/response";

const admin = new OpenAPIHono();

const responseSchema = z.object({
  success: z.boolean(),
  message: z.string().optional(),
  data: z.any().optional(),
});

// --- List Users (Admin) ---
const listUsersRoute = createRoute({
  method: 'get',
  path: '/users',
  tags: ['Admin'],
  summary: 'List all users',
  request: {
    query: z.object({
      page: z.string().optional().openapi({ example: "1" }),
      limit: z.string().optional().openapi({ example: "10" }),
      role: z.string().optional().openapi({ example: "CUSTOMER" }),
      search: z.string().optional().openapi({ example: "john" }),
    }),
  },
  responses: {
    200: {
      content: {
        'application/json': {
          schema: responseSchema,
        },
      },
      description: 'Users retrieved successfully',
    },
    404: {
      content: {
        'application/json': {
          schema: responseSchema,
        },
      },
      description: 'Users not found',
    },
  },
});

admin.openapi(listUsersRoute, roleGuard(["ADMIN", "SUPERADMIN"]) as any, async (c: any) => {
  const page = Number(c.req.query("page")) || 1;
  const limit = Number(c.req.query("limit")) || 10;
  const role = c.req.query("role") as Role | undefined;
  const search = c.req.query("search");

  const result = await AdminService.getAllUsers(page, limit, role, search);
  
  if (!result.data || result.data.length === 0) {
    return apiNotFound(c, "Data pengguna tidak tersedia");
  }

  return apiResponse(c, 200, "Users retrieved successfully", result);
});

// --- Update User Role (Superadmin) ---
const updateUserRoleRoute = createRoute({
  method: 'patch',
  path: '/users/{id}/role',
  tags: ['Admin'],
  summary: 'Update user role',
  request: {
    params: z.object({
      id: z.string(),
    }),
    body: {
      content: {
        'application/json': {
          schema: updateRoleSchema,
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
      description: 'User role updated successfully',
    },
  },
});

admin.openapi(updateUserRoleRoute, roleGuard(["SUPERADMIN"]) as any, async (c: any) => {
  const targetUserId = c.req.param("id");
  const { role } = c.req.valid("json");
  
  // Get admin ID from context (set by roleGuard)
  const user = c.get("user" as any) as { sub: string };
  const adminId = user.sub;

  try {
    const result = await AdminService.updateUserRole(adminId, targetUserId, role as Role);
    return apiResponse(c, 200, "User role updated successfully", result);
  } catch (error) {
    return apiResponse(c, 500, "Failed to update role", String(error));
  }
});

// --- View Audit Logs (Admin) ---
const getAuditLogsRoute = createRoute({
  method: 'get',
  path: '/audit-logs',
  tags: ['Admin'],
  summary: 'View audit logs',
  request: {
    query: z.object({
      page: z.string().optional().openapi({ example: "1" }),
      limit: z.string().optional().openapi({ example: "20" }),
    }),
  },
  responses: {
    200: {
      content: {
        'application/json': {
          schema: responseSchema,
        },
      },
      description: 'Audit logs retrieved successfully',
    },
    404: {
      content: {
        'application/json': {
          schema: responseSchema,
        },
      },
      description: 'Audit logs not found',
    },
  },
});

admin.openapi(getAuditLogsRoute, roleGuard(["ADMIN", "SUPERADMIN"]) as any, async (c: any) => {
  const page = Number(c.req.query("page")) || 1;
  const limit = Number(c.req.query("limit")) || 20;

  const result = await AdminService.getAuditLogs(page, limit);
  
  if (!result.data || result.data.length === 0) {
    return apiNotFound(c, "Audit logs tidak tersedia");
  }

  return apiResponse(c, 200, "Audit logs retrieved successfully", result);
});

export default admin;
