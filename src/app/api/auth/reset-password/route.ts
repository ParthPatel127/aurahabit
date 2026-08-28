import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json(
    { error: "Direct password override is disabled for security. Use /api/auth/reset-password/request and /api/auth/reset-password/verify." },
    { status: 403 }
  );
}
