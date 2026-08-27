import webpush from "web-push";

const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || "BF2mwhYFvnkCk2K9b8SBfu5l2KwzJ2T8ugWAWIHr_PssXJCUlsrpQlEn6yBCq2BQjNItim9uRqSOIek4Ar2CTQc";
const privateKey = process.env.VAPID_PRIVATE_KEY || "RfwM4qayuRp3H6IUcjUK-70uX_L5-QrKxBAXnxPgqRs";

webpush.setVapidDetails(
  "mailto:support@aurahabit.com",
  publicKey,
  privateKey
);

export async function sendWebPush(subscription: { endpoint: string; keys: { p256dh: string; auth: string } }, payload: { title: string; body: string; tag?: string; url?: string }) {
  try {
    const pushSubscription = {
      endpoint: subscription.endpoint,
      keys: {
        p256dh: subscription.keys.p256dh,
        auth: subscription.keys.auth,
      },
    };

    await webpush.sendNotification(
      pushSubscription,
      JSON.stringify(payload)
    );
    return { success: true };
  } catch (error: any) {
    console.error("Web push dispatch error:", error);
    return { success: false, error: error.message };
  }
}
