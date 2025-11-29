import { prisma } from "../../utils/prisma";
import { sign } from "hono/jwt";
import { HTTPException } from "hono/http-exception";
import type { RegisterDTO, LoginDTO, ForgotPasswordDTO, VerifyOtpDTO, ResetPasswordDTO } from "./auth.dto";
import otpGenerator from "otp-generator";
import { sendEmail } from "../../utils/email";

const JWT_SECRET = process.env.JWT_SECRET || "supersecret";

export const AuthService = {
  async register(data: RegisterDTO) {
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      throw new HTTPException(400, { message: "Email already registered" });
    }

    const hashedPassword = await Bun.password.hash(data.password, {
      algorithm: "bcrypt",
      cost: 10,
    });

    const user = await prisma.user.create({
      data: {
        email: data.email,
        password: hashedPassword,
        name: data.name,
        role: "CUSTOMER", // Default role
      },
    });

    // Return user without password
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  },

  async login(data: LoginDTO) {
    const user = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (!user) {
      throw new HTTPException(401, { message: "Invalid credentials" });
    }

    const isPasswordValid = await Bun.password.verify(data.password, user.password);

    if (!isPasswordValid) {
      throw new HTTPException(401, { message: "Invalid credentials" });
    }

    const payload = {
      sub: user.id,
      role: user.role,
      exp: Math.floor(Date.now() / 1000) + 60 * 15, // 15 minutes (Short-lived)
    };

    const accessToken = await sign(payload, JWT_SECRET);

    // Generate Refresh Token (Long-lived: 7 days)
    const refreshToken = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    // Save Refresh Token to DB
    await prisma.refreshToken.create({
      data: {
        token: refreshToken,
        userId: user.id,
        expiresAt: expiresAt,
      },
    });

    const { password, ...userWithoutPassword } = user;
    return { user: userWithoutPassword, accessToken, refreshToken };
  },

  async refreshToken(token: string) {
    // 1. Find Token in DB
    const storedToken = await prisma.refreshToken.findUnique({
      where: { token },
      include: { user: true },
    });

    if (!storedToken) {
      throw new HTTPException(401, { message: "Invalid refresh token" });
    }

    // 2. Check Expiry
    if (new Date() > storedToken.expiresAt) {
      // Cleanup expired token
      await prisma.refreshToken.delete({ where: { id: storedToken.id } });
      throw new HTTPException(401, { message: "Refresh token expired" });
    }

    // 3. Token Rotation: Delete old token (prevent replay attack)
    await prisma.refreshToken.delete({ where: { id: storedToken.id } });

    // 4. Generate New Tokens
    const payload = {
      sub: storedToken.user.id,
      role: storedToken.user.role,
      exp: Math.floor(Date.now() / 1000) + 60 * 15, // 15 mins
    };

    const newAccessToken = await sign(payload, JWT_SECRET);
    const newRefreshToken = crypto.randomUUID();
    const newExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    // 5. Save New Refresh Token
    await prisma.refreshToken.create({
      data: {
        token: newRefreshToken,
        userId: storedToken.user.id,
        expiresAt: newExpiresAt,
      },
    });

    return { accessToken: newAccessToken, refreshToken: newRefreshToken };
  },

  async logout(token: string) {
    try {
      await prisma.refreshToken.delete({ where: { token } });
    } catch (error) {
      // Ignore if token not found, just return success
    }
    return { message: "Logged out successfully" };
  },

  async forgotPassword(data: ForgotPasswordDTO) {
    const user = await prisma.user.findUnique({ where: { email: data.email } });
    if (!user) {
      // Security: Don't reveal if user exists
      return { message: "If email exists, OTP has been sent." };
    }

    // Generate OTP
    const otp = otpGenerator.generate(6, {
      upperCaseAlphabets: false,
      specialChars: false,
      lowerCaseAlphabets: false,
      digits: true,
    });

    // Set Expiry (15 mins)
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

    // Save to DB
    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetToken: otp,
        resetTokenExpires: expiresAt,
      },
    });

    // Log OTP for dev
    console.log(`[DEV] OTP for ${data.email}: ${otp}`);

    // Send Email
    await sendEmail(
      data.email,
      "Password Reset OTP",
      `<p>Your OTP for password reset is: <strong>${otp}</strong></p><p>Valid for 15 minutes.</p>`
    );

    return { message: "If email exists, OTP has been sent." };
  },

  async verifyOtp(data: VerifyOtpDTO) {
    const user = await prisma.user.findUnique({ where: { email: data.email } });
    
    if (!user || !user.resetToken || !user.resetTokenExpires) {
      throw new HTTPException(400, { message: "Invalid OTP" });
    }

    if (user.resetToken !== data.otp) {
      throw new HTTPException(400, { message: "Invalid OTP" });
    }

    if (new Date() > user.resetTokenExpires) {
      throw new HTTPException(400, { message: "OTP Expired" });
    }

    return { valid: true };
  },

  async resetPassword(data: ResetPasswordDTO) {
    // Verify OTP again
    await this.verifyOtp({ email: data.email, otp: data.otp });

    const user = await prisma.user.findUniqueOrThrow({ where: { email: data.email } });

    // Hash new password
    const hashedPassword = await Bun.password.hash(data.newPassword, {
      algorithm: "bcrypt",
      cost: 10,
    });

    // Update DB
    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetToken: null,
        resetTokenExpires: null,
      },
    });

    return { message: "Password reset successful" };
  },
};
