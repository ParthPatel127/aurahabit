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
    // Today is ALWAYS allowed. Yesterday is allowed before 8:00 AM. Future & older past dates are locked.
    const parts = date.split("-").map(Number);
    let isEditable = false;

    if (parts.length === 3) {
      const [cYear, cMonth, cDay] = parts;
      const now = new Date();
      const todayMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const targetMidnight = new Date(cYear, cMonth - 1, cDay);

      const diffMs = todayMidnight.getTime() - targetMidnight.getTime();
      const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

      if (diffDays === 0) {
        isEditable = true; // Today is always editable
      } else if (diffDays === 1 && now.getHours() < 8) {
        isEditable = true; // Yesterday is editable before 8:00 AM
      }
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
