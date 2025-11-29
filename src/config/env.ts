import { z } from "zod";
import "dotenv/config";

const envSchema = z.object({
  PORT: z.coerce.number().default(3001),
  DATABASE_URL: z.string().url({ message: "Invalid DATABASE_URL format" }),
  JWT_SECRET: z.string().min(32, { message: "JWT_SECRET must be at least 32 characters" }),
  MIDTRANS_SERVER_KEY: z.string().min(1, { message: "MIDTRANS_SERVER_KEY is required" }),
  SUPABASE_URL: z.string().url({ message: "Invalid SUPABASE_URL format" }),
  SUPABASE_KEY: z.string().min(1, { message: "SUPABASE_KEY is required" }),
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.coerce.number().optional(),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
  FRONTEND_URL: z.string().url().optional().default("http://localhost:5173"),
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
});

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  console.error("❌ Invalid environment variables:");
  parsedEnv.error.issues.forEach((issue) => {
    console.error(`   -> ${issue.path.join(".")}: ${issue.message}`);
  });
  process.exit(1);
}

export const env = parsedEnv.data;
