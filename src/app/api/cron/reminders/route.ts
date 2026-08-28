import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendWebPush } from "@/lib/web-push";

export async function GET(req: Request) {
  try {
    const authHeader = req.headers.get("authorization");
    if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const now = new Date();
    const hours = String(now.getHours()).padStart(2, "0");
    const minutes = String(now.getMinutes()).padStart(2, "0");
    const currentTimeStr = `${hours}:${minutes}`;

    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    const todayStr = `${year}-${month}-${day}`;

    // Query unarchived habits with push-subscribed users
    const habits = await prisma.habit.findMany({
      where: {
        archived: false,
      },
      include: {
        user: {
          include: {
            pushSubscriptions: true,
          },
        },
        completions: {
          where: { date: todayStr },
        },
      },
    });

    let notificationsSent = 0;

    for (const habit of habits) {
      const isCompletedToday = habit.completions.some((c) => c.completed);
      if (isCompletedToday) continue;

      const subscriptions = habit.user.pushSubscriptions;
      if (!subscriptions || subscriptions.length === 0) continue;

      const title = `Habit Reminder: ${habit.name} ⏰`;
      const body = `Scheduled Time: ${habit.timeSlot || habit.reminderTime || "Today"}. Time to check off "${habit.name}"!`;

      for (const sub of subscriptions) {
        const res = await sendWebPush(
          {
            endpoint: sub.endpoint,
            keys: {
              p256dh: sub.p256dh,
              auth: sub.auth,
            },
          },
          {
            title,
            body,
            tag: `habit_${habit.id}_${todayStr}`,
            url: "/dashboard",
          }
        );
        if (res.success) notificationsSent++;
      }
    }

    return NextResponse.json({
      success: true,
      currentTimeStr,
      todayStr,
      notificationsSent,
    });
  } catch (error: any) {
    console.error("Cron reminders error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
