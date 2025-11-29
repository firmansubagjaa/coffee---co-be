import { prisma } from "../../utils/prisma";

export const SocialService = {
  async toggleWishlist(userId: string, productId: string) {
    const existing = await prisma.wishlist.findUnique({
      where: {
        userId_productId: { userId, productId },
      },
    });

    if (existing) {
      await prisma.wishlist.delete({
        where: { id: existing.id },
      });
      return { status: "removed" };
    } else {
      await prisma.wishlist.create({
        data: { userId, productId },
      });
      return { status: "added" };
    }
  },

  async getWishlist(userId: string) {
    return await prisma.wishlist.findMany({
      where: { userId },
      include: { product: true },
    });
  },

  async addReview(userId: string, productId: string, rating: number, comment?: string) {
    const review = await prisma.review.create({
      data: { userId, productId, rating, comment },
    });

    // Recalculate product rating
    const aggregations = await prisma.review.aggregate({
      where: { productId },
      _avg: { rating: true },
    });

    const newRating = aggregations._avg.rating || 0;

    await prisma.product.update({
      where: { id: productId },
      data: { rating: newRating },
    });

    return review;
  },

  async getReviews(productId: string) {
    return await prisma.review.findMany({
      where: { productId },
      include: { user: { select: { name: true, avatarColor: true } } },
      orderBy: { createdAt: "desc" },
    });
  },
};
