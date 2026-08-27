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

    // Strict Date Locking Rule (Timezone & UTC Aware):
    // Allows today's check-ins globally (including UTC timezone offsets) and yesterday before 8:00 AM.
    const parts = date.split("-").map(Number);
    let isEditable = false;

    if (parts.length === 3) {
      const [cYear, cMonth, cDay] = parts;
      const now = new Date();
      const todayMidnight = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
      const targetMidnight = new Date(Date.UTC(cYear, cMonth - 1, cDay));

      const diffMs = todayMidnight.getTime() - targetMidnight.getTime();
      const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

      // diffDays === 0: Target matches server UTC date
      // diffDays === -1: Target is local today in ahead timezones (IST, Asia, Pacific)
      // diffDays === 1: Target is yesterday (allowed before 8 AM cutoff)
      if (diffDays === 0 || diffDays === -1) {
        isEditable = true;
      } else if (diffDays === 1 && now.getUTCHours() < 14) {
        isEditable = true;
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
