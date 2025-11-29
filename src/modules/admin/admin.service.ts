import { prisma } from "../../utils/prisma";
import { Role } from "../../../generated/prisma/client";

export const AdminService = {
  // --- User Management ---
  async getAllUsers(page: number = 1, limit: number = 10, role?: Role, search?: string) {
    const skip = (page - 1) * limit;
    
    const whereClause: any = {};
    if (role) {
      whereClause.role = role;
    }
    if (search) {
      whereClause.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where: whereClause,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: { // Exclude password
          id: true,
          email: true,
          name: true,
          role: true,
          createdAt: true,
          lastVisit: true,
        }
      }),
      prisma.user.count({ where: whereClause }),
    ]);

    return {
      data: users,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      }
    };
  },

  async updateUserRole(adminId: string, targetUserId: string, newRole: Role) {
    return prisma.$transaction(async (tx) => {
      // 1. Update User Role
      const updatedUser = await tx.user.update({
        where: { id: targetUserId },
        data: { role: newRole },
        select: { id: true, email: true, role: true } // Return minimal info
      });

      // 2. Create Audit Log
      await tx.auditLog.create({
        data: {
          userId: adminId, // Who performed the action
          action: "UPDATE_ROLE",
          module: "Users",
          details: `Changed role of user ${targetUserId} (${updatedUser.email}) to ${newRole}`,
          severity: "warning",
        }
      });

      return updatedUser;
    });
  },

  // --- Audit Logs ---
  async getAuditLogs(page: number = 1, limit: number = 20) {
    const skip = (page - 1) * limit;

    const [logs, total] = await Promise.all([
      prisma.auditLog.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: { name: true, email: true, role: true }
          }
        }
      }),
      prisma.auditLog.count(),
    ]);

    return {
      data: logs,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      }
    };
  }
};
