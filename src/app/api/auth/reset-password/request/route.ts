import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendOtpEmail } from "@/lib/email";

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json(
        { error: "Please provide a valid email address." },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();

    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (!user) {
      return NextResponse.json(
        { error: "No account found with this email address." },
        { status: 404 }
      );
    }

    // Generate 6-digit verification OTP code
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes validity

    // Delete previous reset tokens for this email
    await prisma.passwordResetToken.deleteMany({
      where: { email: normalizedEmail },
    });

    // Save verification code securely to database
    await prisma.passwordResetToken.create({
      data: {
        email: normalizedEmail,
        code: verificationCode,
        expiresAt,
      },
    });

    // Dispatch real email via Nodemailer
    const emailResult = await sendOtpEmail(normalizedEmail, verificationCode);

    // SECURE RESPONSE: Never leak or return the OTP code to the frontend client!
    return NextResponse.json({
      success: true,
      message: `A 6-digit OTP code has been dispatched to ${normalizedEmail}. Please check your inbox!`,
      emailSent: emailResult.sent,
    });
  } catch (error: any) {
    console.error("Password reset request error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to process password reset request." },
      { status: 500 }
    );
  }
}
