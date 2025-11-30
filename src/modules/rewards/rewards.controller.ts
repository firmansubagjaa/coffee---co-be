import { OpenAPIHono, createRoute, z } from "@hono/zod-openapi";
import { RewardsService } from "./rewards.service";
import { roleGuard } from "../../middlewares/roleGuard";
import { apiResponse, apiNotFound } from "../../utils/response";

const rewards = new OpenAPIHono();

const responseSchema = z.object({
  success: z.boolean(),
  message: z.string().optional(),
  data: z.any().optional(),
});

// --- Redeem Reward ---
const redeemRewardRoute = createRoute({
  method: 'post',
  path: '/redeem',
  tags: ['Rewards'],
  summary: 'Redeem points for reward',
  request: {
    body: {
      content: {
        'application/json': {
          schema: z.object({
            rewardId: z.string(),
          }),
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
      description: 'Reward redeemed',
    },
  },
});

rewards.openapi(redeemRewardRoute, roleGuard(["CUSTOMER"]) as any, async (c: any) => {
  const user = c.get("user") as any;
  const { rewardId } = c.req.valid("json");
  
  const result = await RewardsService.redeemReward(user.sub, rewardId);
  return apiResponse(c, 200, "Reward redeemed successfully", result);
});

export default rewards;
