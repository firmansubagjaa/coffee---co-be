import { prisma } from "../../utils/prisma";

export const InventoryService = {
  async restockVariant(variantId: string, amount: number) {
    return await prisma.productVariant.update({
      where: { id: variantId },
      data: {
        stock: { increment: amount },
      },
    });
  },

  async getLowStockVariants(threshold: number = 10) {
    return await prisma.productVariant.findMany({
      where: {
        stock: { lte: threshold },
      },
      include: {
        product: {
          select: { name: true, image: true },
        },
      },
    });
  },
};
