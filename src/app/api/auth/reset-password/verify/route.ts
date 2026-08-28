import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { email, code, newPassword } = await req.json();

    if (!email || !code || !newPassword) {
      return NextResponse.json(
        { error: "Email, verification code, and new password are required." },
        { status: 400 }
      );
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { error: "New password must be at least 6 characters long." },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();
    const cleanCode = code.trim();

    // Verify token & expiration
    const resetRecord = await prisma.passwordResetToken.findFirst({
      where: {
        email: normalizedEmail,
        code: cleanCode,
      },
    });

    if (!resetRecord) {
      return NextResponse.json(
        { error: "Invalid verification code. Please check your code or request a new one." },
        { status: 400 }
      );
    }

    if (new Date() > new Date(resetRecord.expiresAt)) {
      // Clean up expired token
      await prisma.passwordResetToken.deleteMany({ where: { email: normalizedEmail } });
      return NextResponse.json(
        { error: "Verification code has expired. Please request a new code." },
        { status: 400 }
      );
    }

    // Verify user exists
    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (!user) {
      return NextResponse.json(
        { error: "No account associated with this email address." },
        { status: 404 }
      );
    }

    // Hash new password and update user
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword },
    });

    // Invalidate used reset tokens
    await prisma.passwordResetToken.deleteMany({
      where: { email: normalizedEmail },
    });

    return NextResponse.json({
      success: true,
      message: "Password reset successfully! You can now log in with your new password.",
    });
  } catch (error: any) {
    console.error("Password verification error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update password." },
      { status: 500 }
    );
  }
}
