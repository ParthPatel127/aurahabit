import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUserId } from "@/lib/get-user-id";
import { formatDate } from "@/lib/utils";

export async function GET(req: Request) {
  try {
    const userId = await getAuthUserId();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const date = searchParams.get("date") || formatDate();

    let waterLog = await prisma.waterLog.findUnique({
      where: {
        userId_date: {
          userId,
          date,
        },
      },
    });

    if (!waterLog) {
      // Get user settings for goal
      const settings = await prisma.userSettings.findUnique({ where: { userId } });
      const goalMl = settings?.dailyWaterGoal || 3000;

      waterLog = await prisma.waterLog.create({
        data: {
          userId,
          date,
          amountMl: 0,
          goalMl,
        },
      });
    }

    return NextResponse.json(waterLog);
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

    const { date, amountMl, goalMl } = await req.json();
    const logDate = date || formatDate();

    const waterLog = await prisma.waterLog.upsert({
      where: {
        userId_date: {
          userId,
          date: logDate,
        },
      },
      update: {
        amountMl: amountMl !== undefined ? amountMl : undefined,
        goalMl: goalMl !== undefined ? goalMl : undefined,
      },
      create: {
        userId,
        date: logDate,
        amountMl: amountMl || 0,
        goalMl: goalMl || 3000,
      },
    });

    return NextResponse.json(waterLog);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
