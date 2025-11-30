import { prisma } from "../../utils/prisma";
import { HTTPException } from "hono/http-exception";
import { Prisma } from "@prisma/client";

export const RewardsService = {
  async redeemReward(userId: string, rewardId: string) {
    return await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      // 1. Get Reward Cost
      const reward = await tx.reward.findUnique({
        where: { id: rewardId },
      });

      if (!reward) {
        throw new HTTPException(404, { message: "Reward not found" });
      }

      const cost = reward.points;

      // 2. Get User Points
      const user = await tx.user.findUniqueOrThrow({
        where: { id: userId },
      });

      // 3. Check Balance
      if (user.points < cost) {
        throw new HTTPException(400, { message: "Insufficient points" });
      }

      // 4. Deduct Points
      const updatedUser = await tx.user.update({
        where: { id: userId },
        data: {
          points: { decrement: cost },
        },
      });

      // 5. Create Redemption Record (Optional, if you have a table for it)
      // await tx.redemption.create({ ... })

      // 6. Return remaining points
      return { remainingPoints: updatedUser.points };
    });
  },
};
