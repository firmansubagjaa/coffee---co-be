import { OpenAPIHono, createRoute, z } from "@hono/zod-openapi";
import { AuthService } from "./auth.service";
import { registerSchema, loginSchema, forgotPasswordSchema, verifyOtpSchema, resetPasswordSchema, refreshTokenSchema, logoutSchema } from "./auth.dto";
import { apiResponse } from "../../utils/response";

const auth = new OpenAPIHono();

const responseSchema = z.object({
  success: z.boolean(),
  message: z.string().optional(),
  data: z.any().optional(),
});

// --- Register ---
const registerRoute = createRoute({
  method: 'post',
  path: '/register',
  tags: ['Auth'],
  summary: 'Register a new user',
  request: {
    body: {
      content: {
        'application/json': {
          schema: registerSchema,
        },
      },
    },
  },
  responses: {
    201: {
      content: {
        'application/json': {
          schema: responseSchema,
        },
      },
      description: 'Registration successful',
    },
  },
});

auth.openapi(registerRoute, async (c) => {
  const data = c.req.valid("json");
  const user = await AuthService.register(data);
  return apiResponse(c, 201, "Registration successful", user);
});

// --- Login ---
const loginRoute = createRoute({
  method: 'post',
  path: '/login',
  tags: ['Auth'],
  summary: 'Login user',
  request: {
    body: {
      content: {
        'application/json': {
          schema: loginSchema,
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
      description: 'Login successful',
    },
  },
});

auth.openapi(loginRoute, async (c) => {
  const data = c.req.valid("json");
  const result = await AuthService.login(data);
  return apiResponse(c, 200, "Login successful", result);
});

// --- Forgot Password ---
const forgotPasswordRoute = createRoute({
  method: 'post',
  path: '/forgot-password',
  tags: ['Auth'],
  summary: 'Request password reset OTP',
  request: {
    body: {
      content: {
        'application/json': {
          schema: forgotPasswordSchema,
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
      description: 'OTP sent',
    },
  },
});

auth.openapi(forgotPasswordRoute, async (c) => {
  const data = c.req.valid("json");
  const result = await AuthService.forgotPassword(data);
  return apiResponse(c, 200, result.message);
});

// --- Verify OTP ---
const verifyOtpRoute = createRoute({
  method: 'post',
  path: '/verify-otp',
  tags: ['Auth'],
  summary: 'Verify OTP',
  request: {
    body: {
      content: {
        'application/json': {
          schema: verifyOtpSchema,
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
      description: 'OTP valid',
    },
  },
});

auth.openapi(verifyOtpRoute, async (c) => {
  const data = c.req.valid("json");
  const result = await AuthService.verifyOtp(data);
  return apiResponse(c, 200, "OTP is valid", result);
});

// --- Reset Password ---
const resetPasswordRoute = createRoute({
  method: 'post',
  path: '/reset-password',
  tags: ['Auth'],
  summary: 'Reset password with OTP',
  request: {
    body: {
      content: {
        'application/json': {
          schema: resetPasswordSchema,
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
      description: 'Password reset successful',
    },
  },
});

auth.openapi(resetPasswordRoute, async (c) => {
  const data = c.req.valid("json");
  const result = await AuthService.resetPassword(data);
  return apiResponse(c, 200, result.message);
});

// --- Refresh Token ---
const refreshTokenRoute = createRoute({
  method: 'post',
  path: '/refresh',
  tags: ['Auth'],
  summary: 'Refresh access token',
  request: {
    body: {
      content: {
        'application/json': {
          schema: refreshTokenSchema,
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
      description: 'Token refreshed',
    },
  },
});

auth.openapi(refreshTokenRoute, async (c) => {
  const data = c.req.valid("json");
  const result = await AuthService.refreshToken(data.refreshToken);
  return apiResponse(c, 200, "Token refreshed", result);
});

// --- Logout ---
const logoutRoute = createRoute({
  method: 'post',
  path: '/logout',
  tags: ['Auth'],
  summary: 'Logout user',
  request: {
    body: {
      content: {
        'application/json': {
          schema: logoutSchema,
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
      description: 'Logged out successfully',
    },
  },
});

auth.openapi(logoutRoute, async (c) => {
  const data = c.req.valid("json");
  await AuthService.logout(data.refreshToken);
  return apiResponse(c, 200, "Logged out successfully");
});

export default auth;
