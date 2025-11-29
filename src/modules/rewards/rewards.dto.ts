import { z } from "zod";

export const redeemRewardSchema = z.object({
  cost: z.number().int().positive({ message: "Cost must be a positive integer" }),
});

export type RedeemRewardDTO = z.infer<typeof redeemRewardSchema>;
