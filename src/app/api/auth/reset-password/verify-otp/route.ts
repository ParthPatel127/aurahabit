import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { email, code } = await req.json();

    if (!email || !code) {
      return NextResponse.json(
        { error: "Email and OTP code are required." },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();
    const cleanCode = code.trim();

    // Look up active OTP token record
    const resetRecord = await prisma.passwordResetToken.findFirst({
      where: {
        email: normalizedEmail,
        code: cleanCode,
      },
    });

    if (!resetRecord) {
      return NextResponse.json(
        { error: "Invalid OTP code. Please check the code or request a new one." },
        { status: 400 }
      );
    }

    if (new Date() > new Date(resetRecord.expiresAt)) {
      await prisma.passwordResetToken.deleteMany({ where: { email: normalizedEmail } });
      return NextResponse.json(
        { error: "OTP code has expired. Please request a new code." },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "OTP code verified successfully!",
    });
  } catch (error: any) {
    console.error("OTP verification error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to verify OTP code." },
      { status: 500 }
    );
  }
}
