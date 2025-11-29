import { z } from "@hono/zod-openapi";

export const createJobSchema = z.object({
  title: z.string().min(3).openapi({ example: "Barista" }),
  location: z.string().min(3).openapi({ example: "Jakarta" }),
  type: z.enum(["Full-time", "Part-time", "Contract"]).openapi({ example: "Full-time" }),
  description: z.string().min(10).openapi({ example: "Job description..." }),
});

export const updateJobSchema = createJobSchema.partial();

export const createLocationSchema = z.object({
  name: z.string().min(3).openapi({ example: "Senopati Store" }),
  address: z.string().min(10).openapi({ example: "Jl. Senopati..." }),
  city: z.string().min(3).openapi({ example: "Jakarta" }),
  phone: z.string().optional().openapi({ example: "+6221..." }),
  coordinates: z.object({
    lat: z.number(),
    lng: z.number(),
  }).optional().openapi({ example: { lat: -6.2, lng: 106.8 } }),
  image: z.string().url().optional().openapi({ example: "https://image.com" }),
  mapUrl: z.string().url().optional().openapi({ example: "https://maps.google.com/..." }),
});

export const updateLocationSchema = createLocationSchema.partial();

export type CreateJobDTO = z.infer<typeof createJobSchema>;
export type UpdateJobDTO = z.infer<typeof updateJobSchema>;
export type CreateLocationDTO = z.infer<typeof createLocationSchema>;
export type UpdateLocationDTO = z.infer<typeof updateLocationSchema>;
