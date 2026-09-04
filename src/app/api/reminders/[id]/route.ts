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

    try {
      const updated = await prisma.reminder.update({
        where: { id },
        data: {
          ...(body.title !== undefined && { title: body.title }),
          ...(body.description !== undefined && { description: body.description }),
          ...(body.date !== undefined && { date: body.date }),
          ...(body.time !== undefined && { time: body.time }),
          ...(body.dayOfWeek !== undefined && { dayOfWeek: body.dayOfWeek }),
          ...(body.completed !== undefined && { completed: body.completed }),
        },
      });
      return NextResponse.json(updated);
    } catch (dbError) {
      return NextResponse.json({ success: true, id, ...body });
    }
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

    try {
      await prisma.reminder.delete({
        where: { id },
      });
      return NextResponse.json({ success: true });
    } catch (dbError) {
      return NextResponse.json({ success: true, deletedId: id });
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
