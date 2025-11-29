import { z } from "@hono/zod-openapi";

export const updateProfileSchema = z.object({
  name: z.string().min(2).optional().openapi({ example: "John Doe" }),
  mobile: z.string().optional().openapi({ example: "+628123456789" }),
  address: z.string().optional().openapi({ example: "Jl. Sudirman No. 1" }),
  country: z.string().optional().openapi({ example: "Indonesia" }),
  avatarColor: z.string().regex(/^#[0-9A-F]{6}$/i, "Invalid hex color").optional().openapi({ example: "#FF5733" }),
});

export type UpdateProfileDTO = z.infer<typeof updateProfileSchema>;
