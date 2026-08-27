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

    const existing = await prisma.goal.findFirst({
      where: { id, userId },
    });

    if (!existing) {
      return NextResponse.json({ error: "Goal not found" }, { status: 404 });
    }

    const todayStr = new Date().toISOString().split("T")[0];
    let lDays = body.loggedDays !== undefined ? Number(body.loggedDays) : existing.loggedDays;
    let tDays = body.targetDays !== undefined ? Number(body.targetDays) : existing.targetDays;
    let lastCheckinDate = existing.lastCheckinDate;

    // Handle single daily checkin increment
    if (body.incrementDay) {
      if (existing.lastCheckinDate === todayStr) {
        return NextResponse.json(
          { error: "You have already logged progress for this goal today!" },
          { status: 400 }
        );
      }
      lDays = Math.min(tDays, lDays + 1);
      lastCheckinDate = todayStr;
    }

    let progress = Math.min(100, Math.round((lDays / Math.max(tDays, 1)) * 100));
    if (body.progress !== undefined && !body.incrementDay) {
      progress = Number(body.progress);
    }

    let status = body.status !== undefined ? body.status : existing.status;
    if (progress >= 100) {
      status = "COMPLETED";
    }

    const updated = await prisma.goal.update({
      where: { id },
      data: {
        title: body.title !== undefined ? body.title : existing.title,
        description: body.description !== undefined ? body.description : existing.description,
        timeframe: body.timeframe !== undefined ? body.timeframe : existing.timeframe,
        targetDate: body.targetDate !== undefined ? body.targetDate : existing.targetDate,
        status,
        loggedDays: lDays,
        targetDays: tDays,
        progress,
        lastCheckinDate,
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
    await prisma.goal.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Goal deleted successfully" });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
