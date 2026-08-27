import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUserId } from "@/lib/get-user-id";

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await getAuthUserId();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();

    const existing = await prisma.habit.findFirst({
      where: { id, userId },
    });

    if (!existing) {
      return NextResponse.json({ error: "Habit not found" }, { status: 404 });
    }

    let startTime = body.startTime !== undefined ? body.startTime : existing.startTime;
    let endTime = body.endTime !== undefined ? body.endTime : existing.endTime;
    let timeSlot = body.timeSlot !== undefined ? body.timeSlot : existing.timeSlot;

    if (startTime && endTime) {
      timeSlot = `${startTime} to ${endTime}`;
    }

    const updated = await prisma.habit.update({
      where: { id },
      data: {
        name: body.name !== undefined ? body.name : existing.name,
        categoryId: body.categoryId !== undefined ? body.categoryId : existing.categoryId,
        color: body.color !== undefined ? body.color : existing.color,
        icon: body.icon !== undefined ? body.icon : existing.icon,
        frequency: body.frequency !== undefined ? body.frequency : existing.frequency,
        scheduleDays: body.scheduleDays !== undefined ? body.scheduleDays : existing.scheduleDays,
        targetDays: body.targetDays !== undefined ? body.targetDays : existing.targetDays,
        archived: body.archived !== undefined ? body.archived : existing.archived,
        reminderTime: body.reminderTime !== undefined ? body.reminderTime : existing.reminderTime,
        timeSlot: timeSlot || null,
        startTime: startTime || null,
        endTime: endTime || null,
        description: body.description !== undefined ? body.description : existing.description,
      },
      include: {
        category: true,
        completions: true,
      },
    });

    return NextResponse.json(updated);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await getAuthUserId();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const existing = await prisma.habit.findFirst({
      where: { id, userId },
    });

    if (!existing) {
      return NextResponse.json({ error: "Habit not found" }, { status: 404 });
    }

    await prisma.habit.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Habit deleted successfully" });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
