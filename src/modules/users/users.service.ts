import { prisma } from "../../utils/prisma";
import { UpdateProfileDTO } from "./users.dto";

export const UsersService = {
  async updateProfile(userId: string, data: UpdateProfileDTO) {
    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        name: data.name,
        mobile: data.mobile,
        address: data.address,
        country: data.country,
        avatarColor: data.avatarColor,
      },
    });

    // Return user without password
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  },
};
