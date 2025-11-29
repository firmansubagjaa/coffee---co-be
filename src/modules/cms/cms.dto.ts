import { z } from "@hono/zod-openapi";

// --- Job Schemas ---
export const createJobSchema = z.object({
  title: z.string().min(3).openapi({ example: "Senior Barista" }),
  location: z.string().min(3).openapi({ example: "Jakarta" }),
  type: z.enum(["Full-time", "Part-time", "Contract", "Internship"]).openapi({ example: "Full-time" }),
  description: z.string().min(10).openapi({ example: "<p>Job description...</p>" }),
  isActive: z.boolean().default(true).openapi({ example: true }),
});

export const updateJobSchema = createJobSchema.partial();

// --- Location Schemas ---
export const createLocationSchema = z.object({
  name: z.string().min(3).openapi({ example: "Senopati Flagship" }),
  address: z.string().min(5).openapi({ example: "Jl. Senopati No. 10" }),
  city: z.string().optional().openapi({ example: "Jakarta" }),
  phone: z.string().optional().openapi({ example: "+62 21 555 0001" }),
  image: z.string().url().optional().openapi({ example: "https://example.com/store.jpg" }),
  mapUrl: z.string().url().optional().openapi({ example: "https://maps.google.com/..." }),
  coordinates: z.object({
    lat: z.number(),
    lng: z.number(),
  }).optional().openapi({ example: { lat: -6.2305, lng: 106.8086 } }),
  isActive: z.boolean().default(true).openapi({ example: true }),
});

export const updateLocationSchema = createLocationSchema.partial();

export type CreateJobDTO = z.infer<typeof createJobSchema>;
export type UpdateJobDTO = z.infer<typeof updateJobSchema>;
export type CreateLocationDTO = z.infer<typeof createLocationSchema>;
export type UpdateLocationDTO = z.infer<typeof updateLocationSchema>;
