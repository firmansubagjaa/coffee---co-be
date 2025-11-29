import { prisma } from "../../utils/prisma";

export const BIService = {
  async getChurnRisk() {
    const users = await prisma.user.findMany({
      select: { id: true, name: true, email: true, lastVisit: true },
    });

    const now = new Date();
    const riskData = users.map((user) => {
      let riskScore = 0;
      if (user.lastVisit) {
        const diffTime = Math.abs(now.getTime() - user.lastVisit.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays > 30) riskScore = 90;
        else if (diffDays > 14) riskScore = 50;
        else riskScore = 10;
      } else {
        riskScore = 100; // Never visited
      }

      return { ...user, riskScore };
    });

    return riskData.sort((a, b) => b.riskScore - a.riskScore).slice(0, 10);
  },

  async getForecast() {
    // Mock Forecast: Get last 7 days sales and project 10% growth
    const last7Days = new Date();
    last7Days.setDate(last7Days.getDate() - 7);

    const sales = await prisma.order.aggregate({
      where: {
        createdAt: { gte: last7Days },
        status: "DELIVERED",
      },
      _sum: { total: true },
    });

    const currentTotal = Number(sales._sum.total || 0);
    const forecast = currentTotal * 1.1;

    return {
      period: "Next 7 Days",
      currentSales: currentTotal,
      forecastSales: forecast,
      growthRate: "10%",
    };
  },
};
