import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUserId } from "@/lib/get-user-id";

export async function GET() {
  try {
    const userId = await getAuthUserId();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let settings = await prisma.userSettings.findUnique({
      where: { userId },
    });

    if (!settings) {
      settings = await prisma.userSettings.create({
        data: {
          userId,
          theme: "system",
          reminderNotifications: true,
          showTimeSlots: false,
          dailyWaterGoal: 3000,
        },
      });
    }

    return NextResponse.json(settings);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const userId = await getAuthUserId();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { theme, reminderNotifications, showTimeSlots, dailyWaterGoal } = await req.json();

    const settings = await prisma.userSettings.upsert({
      where: { userId },
      update: {
        theme: theme !== undefined ? theme : undefined,
        reminderNotifications: reminderNotifications !== undefined ? reminderNotifications : undefined,
        showTimeSlots: showTimeSlots !== undefined ? showTimeSlots : undefined,
        dailyWaterGoal: dailyWaterGoal !== undefined ? dailyWaterGoal : undefined,
      },
      create: {
        userId,
        theme: theme || "system",
        reminderNotifications: reminderNotifications !== undefined ? reminderNotifications : true,
        showTimeSlots: showTimeSlots !== undefined ? showTimeSlots : false,
        dailyWaterGoal: dailyWaterGoal || 3000,
      },
    });

    return NextResponse.json(settings);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
