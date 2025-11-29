import { prisma } from "../../utils/prisma";

export const ContentService = {
  // --- Jobs ---
  async createJob(data: any) {
    return await prisma.jobPosting.create({ data });
  },
  async getJobs(activeOnly: boolean = true) {
    return await prisma.jobPosting.findMany({
      where: activeOnly ? { isActive: true } : {},
      orderBy: { createdAt: "desc" },
    });
  },
  async updateJob(id: string, data: any) {
    return await prisma.jobPosting.update({ where: { id }, data });
  },
  async deleteJob(id: string) {
    return await prisma.jobPosting.delete({ where: { id } });
  },

  // --- Locations ---
  async createLocation(data: any) {
    return await prisma.storeLocation.create({ data });
  },
  async getLocations(activeOnly: boolean = true) {
    return await prisma.storeLocation.findMany({
      where: activeOnly ? { isActive: true } : {},
      orderBy: { name: "asc" },
    });
  },
  async updateLocation(id: string, data: any) {
    return await prisma.storeLocation.update({ where: { id }, data });
  },
  async deleteLocation(id: string) {
    return await prisma.storeLocation.delete({ where: { id } });
  },
};
