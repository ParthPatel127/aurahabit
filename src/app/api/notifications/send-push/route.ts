import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUserId } from "@/lib/get-user-id";
import { sendWebPush } from "@/lib/web-push";

export async function POST(req: Request) {
  try {
    const userId = await getAuthUserId();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { title, body, tag, url } = await req.json();

    const subscriptions = await prisma.pushSubscription.findMany({
      where: { userId },
    });

    if (subscriptions.length === 0) {
      return NextResponse.json({ success: false, message: "No active push subscriptions found" });
    }

    const payload = {
      title: title || "AuraHabit Alert ⚡",
      body: body || "You have a habit reminder!",
      tag: tag || "habit-reminder",
      url: url || "/dashboard",
    };

    const results = await Promise.all(
      subscriptions.map(async (sub) => {
        return sendWebPush(
          {
            endpoint: sub.endpoint,
            keys: {
              p256dh: sub.p256dh,
              auth: sub.auth,
            },
          },
          payload
        );
      })
    );

    return NextResponse.json({ success: true, count: results.length });
  } catch (error: any) {
    console.error("Send push API error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
