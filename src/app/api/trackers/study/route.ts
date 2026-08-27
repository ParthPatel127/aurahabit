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
    const date = searchParams.get("date");

    const where: any = { userId };
    if (date) where.date = date;

    const studyLogs = await prisma.studyLog.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(studyLogs);
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

    const { date, subject, durationMinutes, topicsCompleted, pomodoroCount, notes } = await req.json();

    if (!subject) {
      return NextResponse.json({ error: "Subject is required" }, { status: 400 });
    }

    const log = await prisma.studyLog.create({
      data: {
        userId,
        date: date || formatDate(),
        subject,
        durationMinutes: durationMinutes || 0,
        topicsCompleted: topicsCompleted || null,
        pomodoroCount: pomodoroCount || 0,
        notes: notes || null,
      },
    });

    return NextResponse.json(log);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
