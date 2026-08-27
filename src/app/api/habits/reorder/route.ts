import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUserId } from "@/lib/get-user-id";

export async function POST(req: Request) {
  try {
    const userId = await getAuthUserId();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { habitIds } = await req.json();
    if (!Array.isArray(habitIds)) {
      return NextResponse.json({ error: "habitIds array required" }, { status: 400 });
    }

    // Reorder habits sequentially
    for (let index = 0; index < habitIds.length; index++) {
      const id = habitIds[index];
      await prisma.habit.updateMany({
        where: { id, userId },
        data: { order: index },
      });
    }

    return NextResponse.json({ message: "Habits reordered successfully" });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
