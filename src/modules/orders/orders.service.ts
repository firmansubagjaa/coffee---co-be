import { prisma } from "../../utils/prisma";
import { HTTPException } from "hono/http-exception";
import type { CreateOrderDTO } from "./orders.dto";
import { events } from "../../utils/events";

export const OrderService = {
  async createOrder(data: CreateOrderDTO) {
    const order = await prisma.$transaction(async (tx) => {
      let totalAmount = 0;
      const orderItemsData = [];

      for (const item of data.items) {
        // 1. Atomic Update: Decrement stock ONLY if sufficient
        console.log(`[OrderService] Attempting to update variant ${item.variantId} with qty ${item.quantity}`);
        
        const updatedVariant = await tx.productVariant.updateMany({
          where: {
            id: item.variantId,
            stock: {
              gte: item.quantity, // Condition: Stock >= Quantity
            },
          },
          data: {
            stock: {
              decrement: item.quantity,
            },
          },
        });

        console.log(`[OrderService] Update result count: ${updatedVariant.count}`);

        if (updatedVariant.count === 0) {
          throw new HTTPException(400, {
            message: `Insufficient stock for variant ID: ${item.variantId}`,
          });
        }

        // 2. Fetch details for OrderItem
        const variant = await tx.productVariant.findUniqueOrThrow({
          where: { id: item.variantId },
          include: { product: true },
        });

        const itemTotal = Number(variant.price) * item.quantity;
        totalAmount += itemTotal;

        orderItemsData.push({
          productId: variant.productId,
          productName: variant.product.name,
          productImage: variant.product.image,
          variantId: variant.id,
          quantity: item.quantity,
          price: variant.price,
        });
      }

      // 3. Create Order
      const newOrder = await tx.order.create({
        data: {
          userId: data.userId,
          total: totalAmount,
          status: "PENDING",
          items: {
            create: orderItemsData,
          },
        },
        include: {
          items: true,
        },
      });

      // 4. Add Reward Points (10% of Total)
      const pointsEarned = Math.floor(totalAmount * 0.1);
      if (pointsEarned > 0) {
        await tx.user.update({
          where: { id: data.userId },
          data: {
            points: { increment: pointsEarned },
          },
        });
      }

      return newOrder;
    });

    // Emit Real-time Event
    events.emit("new_order", order);

    return order;
  },
  async getAllOrders() {
    return await prisma.order.findMany({
      include: {
        items: true,
        user: {
          select: { name: true, email: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  },
};
