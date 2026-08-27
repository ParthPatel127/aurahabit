import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUserId } from "@/lib/get-user-id";

export async function POST(req: Request) {
  try {
    const userId = await getAuthUserId();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { habitId, date, completed } = await req.json();

    if (!habitId || !date) {
      return NextResponse.json({ error: "habitId and date are required" }, { status: 400 });
    }

    // Verify habit ownership
    const habit = await prisma.habit.findFirst({
      where: { id: habitId, userId },
    });

    if (!habit) {
      return NextResponse.json({ error: "Habit not found" }, { status: 404 });
    }

    // Strict Date Locking Rule:
    // Only Today is allowed, or Yesterday before 8:00 AM (8-hour grace period).
    const now = new Date();
    const todayStr = now.toISOString().split("T")[0];

    const yesterdayObj = new Date(now);
    yesterdayObj.setDate(yesterdayObj.getDate() - 1);
    const yesterdayStr = yesterdayObj.toISOString().split("T")[0];

    const currentHour = now.getHours();

    let isEditable = false;
    if (date === todayStr) {
      isEditable = true;
    } else if (date === yesterdayStr && currentHour < 8) {
      isEditable = true;
    }

    if (!isEditable) {
      return NextResponse.json(
        { error: "This date is locked. Check-ins are only allowed for Today, or Yesterday before 8:00 AM (Grace Period)." },
        { status: 400 }
      );
    }

    const existing = await prisma.habitCompletion.findUnique({
      where: {
        habitId_date: {
          habitId,
          date,
        },
      },
    });

    if (existing) {
      const updated = await prisma.habitCompletion.update({
        where: { id: existing.id },
        data: {
          completed: completed !== undefined ? completed : !existing.completed,
        },
      });
      return NextResponse.json(updated);
    } else {
      const created = await prisma.habitCompletion.create({
        data: {
          habitId,
          date,
          completed: completed !== undefined ? completed : true,
        },
      });
      return NextResponse.json(created);
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
