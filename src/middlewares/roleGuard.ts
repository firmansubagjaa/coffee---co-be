import { createMiddleware } from "hono/factory";
import { HTTPException } from "hono/http-exception";
import { verify } from "hono/jwt";

// Define Role type based on Prisma Enum
type Role = "CUSTOMER" | "BARISTA" | "DATA_ANALYST" | "ADMIN" | "SUPERADMIN";

export const roleGuard = (allowedRoles: Role[]) => {
  return createMiddleware(async (c, next) => {
    const authHeader = c.req.header("Authorization");

    if (!authHeader) {
      throw new HTTPException(401, { message: "Unauthorized: No token provided" });
    }

    const token = authHeader.split(" ")[1]; // Bearer <token>
    if (!token) {
      throw new HTTPException(401, { message: "Unauthorized: Invalid token format" });
    }

    try {
      // Verify token
      // NOTE: In a real app, JWT_SECRET should be in env and strictly typed
      const secret = process.env.JWT_SECRET || "supersecret";
      const payload = await verify(token, secret);

      // Check if user role is allowed
      const userRole = payload.role as Role;
      if (!allowedRoles.includes(userRole)) {
        throw new HTTPException(403, { message: "Forbidden: Insufficient permissions" });
      }

      // Attach user info to context for downstream handlers
      c.set("user", payload);
      
      await next();
    } catch (error) {
      if (error instanceof HTTPException) {
        throw error;
      }
      throw new HTTPException(401, { message: "Unauthorized: Invalid token" });
    }
  });
};
