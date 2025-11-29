import { z } from "@hono/zod-openapi";

export const updateRoleSchema = z.object({
  role: z.enum(["CUSTOMER", "BARISTA", "DATA_ANALYST", "ADMIN", "SUPERADMIN"]).openapi({ example: "BARISTA" }),
});
