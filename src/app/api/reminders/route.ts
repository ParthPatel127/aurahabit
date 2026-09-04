import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUserId } from "@/lib/get-user-id";
import { format, parseISO } from "date-fns";

// In-memory store fallback for development when local postgres isn't running
let inMemoryReminders: any[] = [];

export async function GET(req: Request) {
  try {
    const userId = await getAuthUserId();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
      const reminders = await prisma.reminder.findMany({
        where: { userId },
        orderBy: [{ date: "asc" }, { time: "asc" }],
      });
      return NextResponse.json(reminders);
    } catch (dbError) {
      // Fallback to in-memory store filtered by userId
      const userReminders = inMemoryReminders.filter((r) => r.userId === userId);
      return NextResponse.json(userReminders);
    }
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
    const { title, description, date, time, dayOfWeek } = body;

    if (!title || !date || !time) {
      return NextResponse.json(
        { error: "Title, date, and time are required" },
        { status: 400 }
      );
    }

    // Auto-calculate dayOfWeek from date if not explicitly provided
    let calculatedDay = dayOfWeek;
    if (!calculatedDay && date) {
      try {
        calculatedDay = format(parseISO(date), "EEEE");
      } catch (e) {
        calculatedDay = "Today";
      }
    }

    try {
      const reminder = await prisma.reminder.create({
        data: {
          userId,
          title,
          description: description || null,
          date,
          time,
          dayOfWeek: calculatedDay || "Scheduled",
          completed: false,
        },
      });
      return NextResponse.json(reminder);
    } catch (dbError) {
      // In-memory fallback
      const newReminder = {
        id: `rem_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        userId,
        title,
        description: description || null,
        date,
        time,
        dayOfWeek: calculatedDay || "Scheduled",
        completed: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      inMemoryReminders.push(newReminder);
      return NextResponse.json(newReminder);
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
