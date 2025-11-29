import { Context } from "hono";
import { StatusCode } from "hono/utils/http-status";

/**
 * Standardized API Response Format
 * @param c Hono Context
 * @param status HTTP Status Code
 * @param message User-friendly message
 * @param data Optional data payload
 */
export const apiResponse = (c: Context, status: StatusCode, message: string, data?: any) => {
  const success = status >= 200 && status < 300;
  return c.json({
    success,
    message,
    data,
  }, status as any);
};

export const apiNotFound = (c: Context, message: string = "Data tidak tersedia") => {
  return c.json({
    success: false,
    message,
    data: null,
  }, 404);
};
