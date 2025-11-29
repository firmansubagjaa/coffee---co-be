import { z } from "@hono/zod-openapi";

// Schemas (Zod v4 syntax)
export const registerSchema = z.object({
  email: z.string().email({ message: "Invalid email address" }).openapi({ example: "user@coffee.co" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }).openapi({ example: "password123" }),
  name: z.string().min(2, { message: "Name must be at least 2 characters" }).openapi({ example: "John Doe" }),
});

export const loginSchema = z.object({
  email: z.string().email({ message: "Invalid email address" }).openapi({ example: "user@coffee.co" }),
  password: z.string().min(1, { message: "Password is required" }).openapi({ example: "password123" }),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email({ message: "Invalid email address" }).openapi({ example: "user@coffee.co" }),
});

export const verifyOtpSchema = z.object({
  email: z.string().email({ message: "Invalid email address" }).openapi({ example: "user@coffee.co" }),
  otp: z.string().length(6, { message: "OTP must be 6 digits" }).openapi({ example: "123456" }),
});

export const resetPasswordSchema = z.object({
  email: z.string().email({ message: "Invalid email address" }).openapi({ example: "user@coffee.co" }),
  otp: z.string().length(6, { message: "OTP must be 6 digits" }).openapi({ example: "123456" }),
  newPassword: z.string().min(6, { message: "Password must be at least 6 characters" }).openapi({ example: "newpassword123" }),
});

export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, { message: "Refresh Token is required" }).openapi({ example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." }),
});

export const logoutSchema = z.object({
  refreshToken: z.string().min(1, { message: "Refresh Token is required" }).openapi({ example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." }),
});

// Types
export type RegisterDTO = z.infer<typeof registerSchema>;
export type LoginDTO = z.infer<typeof loginSchema>;
export type ForgotPasswordDTO = z.infer<typeof forgotPasswordSchema>;
export type VerifyOtpDTO = z.infer<typeof verifyOtpSchema>;
export type ResetPasswordDTO = z.infer<typeof resetPasswordSchema>;
export type RefreshTokenDTO = z.infer<typeof refreshTokenSchema>;
export type LogoutDTO = z.infer<typeof logoutSchema>;
