import { OpenAPIHono, createRoute, z } from "@hono/zod-openapi";
import { RewardsService } from "./rewards.service";
import { redeemRewardSchema } from "./rewards.dto";
import { roleGuard } from "../../middlewares/roleGuard";
import { apiResponse } from "../../utils/response";

const rewards = new OpenAPIHono();

const responseSchema = z.object({
  success: z.boolean(),
  message: z.string().optional(),
  data: z.any().optional(),
});

// Protected Route: Redeem Rewards
const redeemRoute = createRoute({
  method: 'post',
  path: '/redeem',
  tags: ['Rewards'],
  summary: 'Redeem points',
  request: {
    body: {
      content: {
        'application/json': {
          schema: redeemRewardSchema,
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
      description: 'Redemption successful',
    },
  },
});

rewards.openapi(redeemRoute, roleGuard(["CUSTOMER", "BARISTA", "DATA_ANALYST", "ADMIN", "SUPERADMIN"]) as any, async (c: any) => {
  const user = c.get("user") as any; // Temporary cast
  const data = c.req.valid("json");
  
  const result = await RewardsService.redeemPoints(user.sub, data.cost);
  return apiResponse(c, 200, "Redemption successful", result);
});

export default rewards;
