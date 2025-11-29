import nodemailer from "nodemailer";
import { env } from "../config/env";

// Create a transporter
// For development, we can use Ethereal or just log to console if no env vars
// But to satisfy the requirement of using nodemailer, we will set it up.
const transporter = nodemailer.createTransport({
  host: env.SMTP_HOST || "smtp.ethereal.email",
  port: env.SMTP_PORT || 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: env.SMTP_USER || "ethereal_user", // Generate one at https://ethereal.email/create
    pass: env.SMTP_PASS || "ethereal_pass",
  },
});

export const sendEmail = async (to: string, subject: string, html: string) => {
  if (!env.SMTP_HOST && !env.SMTP_USER) {
    console.log(`[MOCK EMAIL] To: ${to}, Subject: ${subject}`);
    return { messageId: "mock-id" };
  }

  try {
    const info = await transporter.sendMail({
      from: '"Coffee & Co" <no-reply@coffeeandco.com>', // sender address
      to, // list of receivers
      subject, // Subject line
      html, // html body
    });

    console.log("Message sent: %s", info.messageId);
    return info;
  } catch (error) {
    console.error("Error sending email:", error);
    return null;
  }
};
