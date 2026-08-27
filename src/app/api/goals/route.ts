import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUserId } from "@/lib/get-user-id";

function getDefaultTargetDays(timeframe: string): number {
  switch (timeframe) {
    case "WEEKLY": return 7;
    case "MONTHLY": return 30;
    case "QUARTERLY": return 90;
    case "YEARLY":
    default: return 365;
  }
}

export async function GET() {
  try {
    const userId = await getAuthUserId();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const goals = await prisma.goal.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(goals);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const userId = await getAuthUserId();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { title, description, timeframe, targetDate, status, loggedDays, targetDays } = await req.json();

    if (!title) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }

    const tf = timeframe || "YEARLY";
    const tDays = targetDays ? Number(targetDays) : getDefaultTargetDays(tf);
    const lDays = loggedDays ? Number(loggedDays) : 0;
    const computedProgress = Math.min(100, Math.round((lDays / Math.max(tDays, 1)) * 100));
    const computedStatus = computedProgress >= 100 ? "COMPLETED" : (status || "IN_PROGRESS");

    const goal = await prisma.goal.create({
      data: {
        userId,
        title,
        description: description || null,
        timeframe: tf,
        targetDate: targetDate || null,
        status: computedStatus,
        loggedDays: lDays,
        targetDays: tDays,
        progress: computedProgress,
      },
    });

    return NextResponse.json(goal);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
