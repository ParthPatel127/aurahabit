import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUserId } from "@/lib/get-user-id";

export async function GET(req: Request) {
  try {
    const userId = await getAuthUserId();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const categoryId = searchParams.get("categoryId");
    const archived = searchParams.get("archived") === "true";

    const where: any = {
      userId,
      archived,
    };

    if (categoryId && categoryId !== "all") {
      where.categoryId = categoryId;
    }

    const habits = await prisma.habit.findMany({
      where,
      include: {
        category: true,
        completions: {
          orderBy: { date: "desc" },
        },
      },
      orderBy: [
        { order: "asc" },
        { createdAt: "desc" },
      ],
    });

    return NextResponse.json(habits);
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

    const body = await req.json();
    const { name, categoryId, color, icon, frequency, scheduleDays, targetDays, reminderTime, timeSlot, startTime, endTime, description } = body;

    if (!name) {
      return NextResponse.json({ error: "Habit name is required" }, { status: 400 });
    }

    let formattedSlot = timeSlot || null;
    if (startTime && endTime) {
      formattedSlot = `From ${startTime} To ${endTime}`;
    }

    // Get max order value
    const maxHabit = await prisma.habit.findFirst({
      where: { userId },
      orderBy: { order: "desc" },
    });
    const newOrder = (maxHabit?.order ?? 0) + 1;

    const habit = await prisma.habit.create({
      data: {
        userId,
        name,
        categoryId: categoryId || null,
        color: color || "#10B981",
        icon: icon || "Target",
        frequency: frequency || "DAILY",
        scheduleDays: scheduleDays || "1,2,3,4,5,6,7",
        targetDays: targetDays || 1,
        reminderTime: reminderTime || null,
        timeSlot: formattedSlot,
        startTime: startTime || null,
        endTime: endTime || null,
        order: newOrder,
        description: description || null,
      },
      include: {
        category: true,
        completions: true,
      },
    });

    return NextResponse.json(habit);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
