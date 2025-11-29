import { prisma } from "../../utils/prisma";

export const FinanceService = {
  async getAlerts() {
    const [lowStock, refundedTransactions, criticalStations] = await Promise.all([
      prisma.productVariant.findMany({
        where: { stock: { lte: 10 } },
        select: { name: true, stock: true },
      }),
      prisma.transaction.findMany({
        where: {
          status: "refunded", // Assuming 'refunded' is a valid status string
          createdAt: {
            gte: new Date(new Date().setHours(0, 0, 0, 0)), // Today
          },
        },
        include: { order: true },
      }),
      prisma.stationLogistics.findMany({
        where: { status: "critical" },
      }),
    ]);

    const alerts = [
      ...lowStock.map((i) => ({ type: "inventory", message: `Low stock: ${i.name} (${i.stock})`, severity: "critical" })),
      ...refundedTransactions.map((t) => ({ type: "transaction", message: `Refunded: Order #${t.order.id}`, severity: "warning" })),
      ...criticalStations.map((s) => ({ type: "logistics", message: `Station Critical: ${s.name}`, severity: "critical" })),
    ];

    return alerts;
  },

  async getPnL() {
    // 1. Revenue (Sum of Order Total for 'DELIVERED' orders)
    const revenueAgg = await prisma.order.aggregate({
      where: { status: "DELIVERED" },
      _sum: { total: true },
    });
    const revenue = Number(revenueAgg._sum.total || 0);

    // 2. COGS (Sum of OrderItem quantity * Variant costPrice)
    // Prisma doesn't support direct cross-table sum easily, so we might need raw query or fetch & calc.
    // For performance, raw query is better, but let's stick to Prisma for safety first.
    // We'll fetch all delivered order items.
    const deliveredItems = await prisma.orderItem.findMany({
      where: {
        order: { status: "DELIVERED" },
      },
      include: {
        variant: { select: { costPrice: true } },
      },
    });

    const cogs = deliveredItems.reduce((acc, item) => {
      const cost = Number(item.variant?.costPrice || 0);
      return acc + (item.quantity * cost);
    }, 0);

    // 3. Expenses
    const expenseAgg = await prisma.expense.aggregate({
      _sum: { amount: true },
    });
    const expenses = Number(expenseAgg._sum.amount || 0);

    // 4. Net Profit
    const netProfit = revenue - cogs - expenses;

    return {
      revenue,
      cogs,
      expenses,
      netProfit,
    };
  },
};
