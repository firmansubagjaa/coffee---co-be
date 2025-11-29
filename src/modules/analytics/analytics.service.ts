import { prisma } from "../../utils/prisma";

export const AnalyticsService = {
  async getRevenueStats() {
    // Group by month (using raw query for date extraction compatibility across DBs, 
    // but for Postgres we can use date_trunc or similar. 
    // For simplicity and Prisma compatibility, we might fetch and process in JS 
    // if dataset is small, but for "efficient aggregation" requested, we should use groupBy if possible.
    // Prisma groupBy on date fields is tricky without raw query.
    // Let's use $queryRaw for best performance on Postgres.
    
    const result = await prisma.$queryRaw`
      SELECT 
        TO_CHAR("createdAt", 'Mon') as name,
        SUM(total) as revenue
      FROM orders
      WHERE status != 'CANCELLED'
      GROUP BY TO_CHAR("createdAt", 'Mon'), DATE_TRUNC('month', "createdAt")
      ORDER BY DATE_TRUNC('month', "createdAt") ASC
      LIMIT 12
    `;

    // Convert BigInt/Decimal to number for JSON
    return (result as any[]).map(item => ({
      name: item.name,
      revenue: Number(item.revenue)
    }));
  },

  async getTopProducts() {
    const result = await prisma.orderItem.groupBy({
      by: ['productName'],
      _sum: {
        quantity: true,
      },
      orderBy: {
        _sum: {
          quantity: 'desc',
        },
      },
      take: 5,
    });

    return result.map(item => ({
      name: item.productName,
      sales: item._sum.quantity || 0,
    }));
  },

  async getSummary() {
    const [totalRevenue, totalUsers, activeOrders] = await Promise.all([
      prisma.order.aggregate({
        _sum: { total: true },
        where: { status: { not: 'CANCELLED' } }
      }),
      prisma.user.count(),
      prisma.order.count({
        where: {
          status: { in: ['PENDING', 'PREPARING', 'READY'] }
        }
      })
    ]);

    return {
      totalRevenue: Number(totalRevenue._sum.total || 0),
      totalUsers,
      activeOrders,
    };
  }
};
