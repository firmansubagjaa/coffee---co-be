import { prisma } from "../../utils/prisma";
import { HTTPException } from "hono/http-exception";

export const RewardsService = {
  async redeemPoints(userId: string, cost: number) {
    return await prisma.$transaction(async (tx) => {
      // 1. Get User Points
      const user = await tx.user.findUniqueOrThrow({
        where: { id: userId },
      });

      // 2. Check Balance
      if (user.points < cost) {
        throw new HTTPException(400, { message: "Insufficient points" });
      }

      // 3. Deduct Points
      const updatedUser = await tx.user.update({
        where: { id: userId },
        data: {
          points: { decrement: cost },
        },
      });

      // 4. Return remaining points
      return { remainingPoints: updatedUser.points };
    });
  },
};
