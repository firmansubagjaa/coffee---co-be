import { prisma } from "../../utils/prisma";
import { StationLogistics } from "../../../generated/prisma/client";

export const LogisticsService = {
  async getAllStations() {
    return await prisma.stationLogistics.findMany({
      orderBy: { lastChecked: "desc" },
    });
  },

  async createStation(data: { name: string; category: string; status: string }) {
    return await prisma.stationLogistics.create({
      data: {
        ...data,
        status: data.status || "ok",
      },
    });
  },

  async updateStationStatus(id: string, status: string, metricValue?: string, unit?: string) {
    return await prisma.stationLogistics.update({
      where: { id },
      data: {
        status,
        metricValue,
        unit,
        lastChecked: new Date(),
      },
    });
  },
};
