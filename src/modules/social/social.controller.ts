import { OpenAPIHono, createRoute, z } from "@hono/zod-openapi";
import { SocialService } from "./social.service";
import { roleGuard } from "../../middlewares/roleGuard";
import { apiResponse, apiNotFound } from "../../utils/response";

const social = new OpenAPIHono();

const responseSchema = z.object({
  success: z.boolean(),
  message: z.string().optional(),
  data: z.any().optional(),
});

// --- Wishlist ---
const toggleWishlistRoute = createRoute({
  method: 'post',
  path: '/wishlist/{productId}',
  tags: ['Social'],
  summary: 'Toggle wishlist',
  request: {
    params: z.object({
      productId: z.string(),
    }),
  },
  responses: {
    200: {
      content: {
        'application/json': {
          schema: responseSchema,
        },
      },
      description: 'Wishlist updated',
    },
  },
});

social.openapi(toggleWishlistRoute, roleGuard(["CUSTOMER", "BARISTA", "ADMIN", "SUPERADMIN"]) as any, async (c: any) => {
  const user = c.get("user") as any;
  const productId = c.req.param("productId");
  const result = await SocialService.toggleWishlist(user.userId, productId);
  return apiResponse(c, 200, "Wishlist updated", result);
});

const getWishlistRoute = createRoute({
  method: 'get',
  path: '/wishlist',
  tags: ['Social'],
  summary: 'Get wishlist',
  responses: {
    200: {
      content: {
        'application/json': {
          schema: responseSchema,
        },
      },
      description: 'Wishlist items',
    },
    404: {
      content: {
        'application/json': {
          schema: responseSchema,
        },
      },
      description: 'Wishlist empty',
    },
  },
});

social.openapi(getWishlistRoute, roleGuard(["CUSTOMER", "BARISTA", "ADMIN", "SUPERADMIN"]) as any, async (c: any) => {
  const user = c.get("user") as any;
  const items = await SocialService.getWishlist(user.userId);
  
  if (!items || items.length === 0) {
    return apiNotFound(c, "Wishlist kosong");
  }

  return apiResponse(c, 200, "Wishlist items", items);
});

// --- Reviews ---
const addReviewRoute = createRoute({
  method: 'post',
  path: '/products/{id}/reviews',
  tags: ['Social'],
  summary: 'Add review',
  request: {
    params: z.object({
      id: z.string(),
    }),
    body: {
      content: {
        'application/json': {
          schema: z.object({
            rating: z.number().min(1).max(5),
            comment: z.string().optional(),
          }),
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
      description: 'Review added',
    },
  },
});

social.openapi(addReviewRoute, roleGuard(["CUSTOMER", "BARISTA", "ADMIN", "SUPERADMIN"]) as any, async (c: any) => {
  const user = c.get("user") as any;
  const productId = c.req.param("id");
  const { rating, comment } = c.req.valid("json");
  const review = await SocialService.addReview(user.userId, productId, rating, comment);
  return apiResponse(c, 201, "Review added", review);
});

const getReviewsRoute = createRoute({
  method: 'get',
  path: '/products/{id}/reviews',
  tags: ['Social'],
  summary: 'Get reviews',
  request: {
    params: z.object({
      id: z.string(),
    }),
  },
  responses: {
    200: {
      content: {
        'application/json': {
          schema: responseSchema,
        },
      },
      description: 'List of reviews',
    },
    404: {
      content: {
        'application/json': {
          schema: responseSchema,
        },
      },
      description: 'Reviews not found',
    },
  },
});

social.openapi(getReviewsRoute, async (c: any) => {
  const productId = c.req.param("id");
  const reviews = await SocialService.getReviews(productId);
  
  if (!reviews || reviews.length === 0) {
    return apiNotFound(c, "Ulasan tidak tersedia");
  }

  return apiResponse(c, 200, "List of reviews", reviews);
});

export default social;
