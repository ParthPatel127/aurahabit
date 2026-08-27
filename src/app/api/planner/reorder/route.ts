import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUserId } from "@/lib/get-user-id";

export async function POST(req: Request) {
  try {
    const userId = await getAuthUserId();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { tasks } = await req.json();
    if (!Array.isArray(tasks)) {
      return NextResponse.json({ error: "tasks array required" }, { status: 400 });
    }

    // Update each task's priority
    for (const t of tasks) {
      if (t.id && t.priority) {
        await prisma.plannerTask.updateMany({
          where: { id: t.id, userId },
          data: { priority: t.priority },
        });
      }
    }

    return NextResponse.json({ message: "Planner tasks reordered successfully" });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
