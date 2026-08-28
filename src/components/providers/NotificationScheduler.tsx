"use client";

import { useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { emitInAppToast, NotificationToastContainer } from "./NotificationToast";

declare global {
  interface Window {
    sendDesktopNotification?: (title: string, body: string) => void;
  }
}

export function NotificationScheduler() {
  const { status } = useSession();
  const triggeredKeysRef = useRef<Set<string>>(new Set());
  const swRegRef = useRef<ServiceWorkerRegistration | null>(null);

  // Register Background Service Worker & Request Permission
  useEffect(() => {
    if (typeof window === "undefined") return;

    // Register Service Worker for Background Notifications
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js")
        .then((reg) => {
          swRegRef.current = reg;
          console.log("Service Worker registered for background push notifications");

          if ("Notification" in window && Notification.permission === "granted") {
            subscribeToPushNotifications(reg);
          }
        })
        .catch((err) => console.error("SW registration error:", err));
    }

    // Auto-request Notification permission
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission().then((perm) => {
        if (perm === "granted" && swRegRef.current) {
          subscribeToPushNotifications(swRegRef.current);
        }
      });
    }

    // Expose global helper for instant on-demand desktop & in-app testing
    window.sendDesktopNotification = (title: string, body: string) => {
      sendSystemNotification(title, body, "test_notification");
    };
  }, []);

  const subscribeToPushNotifications = async (reg: ServiceWorkerRegistration) => {
    try {
      if (!("PushManager" in window)) return;
      const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || "BF2mwhYFvnkCk2K9b8SBfu5l2KwzJ2T8ugWAWIHr_PssXJCUlsrpQlEn6yBCq2BQjNItim9uRqSOIek4Ar2CTQc";

      const padding = "=".repeat((4 - (vapidPublicKey.length % 4)) % 4);
      const base64 = (vapidPublicKey + padding).replace(/\-/g, "+").replace(/_/g, "/");
      const rawData = window.atob(base64);
      const outputArray = new Uint8Array(rawData.length);
      for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
      }

      let sub = await reg.pushManager.getSubscription();
      if (!sub) {
        sub = await reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: outputArray,
        });
      }

      if (sub) {
        await fetch("/api/notifications/subscribe", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ subscription: sub }),
        });
        console.log("Registered for closed-tab background Web Push notifications!");
      }
    } catch (e) {
      console.warn("Push subscription failed:", e);
    }
  };

  const sendSystemNotification = async (title: string, body: string, tag: string) => {
    // 1. Always trigger guaranteed In-App Banner Toast Popup
    emitInAppToast(title, body);

    // 2. Trigger OS / Browser System Notification if allowed
    try {
      if (!("Notification" in window)) return;

      if (Notification.permission === "default") {
        const perm = await Notification.requestPermission();
        if (perm !== "granted") return;
      }

      if (Notification.permission !== "granted") return;

      const options: any = {
        body,
        icon: "/icons/icon-192.png",
        badge: "/icons/icon-192.png",
        tag,
        requireInteraction: true,
        vibrate: [200, 100, 200],
      };

      if (swRegRef.current && swRegRef.current.showNotification) {
        swRegRef.current.showNotification(title, options);
      } else if (navigator.serviceWorker && navigator.serviceWorker.ready) {
        const readyReg = await navigator.serviceWorker.ready;
        readyReg.showNotification(title, options);
      } else {
        new Notification(title, {
          body,
          icon: "/favicon.ico",
          requireInteraction: true,
        });
      }

      // 3. Trigger Server Web Push for closed-tab background delivery
      fetch("/api/notifications/send-push", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, body, tag }),
      }).catch(() => {});
    } catch (e) {
      console.error("System notification error:", e);
    }
  };

  useEffect(() => {
    if (status !== "authenticated") return;

    // Ensure VAPID Push Subscription is saved in PostgreSQL for authenticated user
    if ("serviceWorker" in navigator && "Notification" in window && Notification.permission === "granted") {
      navigator.serviceWorker.ready.then((reg) => {
        subscribeToPushNotifications(reg);
      });
    }

    const checkAndTriggerNotifications = async () => {
      try {
        const res = await fetch("/api/habits");
        const habits = await res.json();
        if (!Array.isArray(habits)) return;

        const now = new Date();
        const currentHours = String(now.getHours()).padStart(2, "0");
        const currentMinutes = String(now.getMinutes()).padStart(2, "0");
        const currentTimeStr = `${currentHours}:${currentMinutes}`;
        const todayStr = now.toISOString().split("T")[0];

        habits.forEach((habit: any) => {
          if (!habit.reminderTime) return;

          const rTime = habit.reminderTime.trim();

          if (rTime === currentTimeStr || rTime.startsWith(currentTimeStr)) {
            const triggerKey = `${habit.id}_${todayStr}_${currentTimeStr}`;
            if (!triggeredKeysRef.current.has(triggerKey)) {
              triggeredKeysRef.current.add(triggerKey);

              const isCompletedToday = (habit.completions || []).some(
                (c: any) => c.date === todayStr && c.completed
              );

              if (!isCompletedToday) {
                const title = `Habit Reminder: ${habit.name} ⏰`;
                const body = `It's ${currentTimeStr}! Scheduled Time: ${habit.timeSlot || 'Scheduled Now'}. Time to check off "${habit.name}".`;
                sendSystemNotification(title, body, triggerKey);
              }
            }
          }
        });

        // Evening Streak Protection Alert (at 20:00 / 8:00 PM)
        if (currentTimeStr === "20:00") {
          const triggerKey = `streak_alert_${todayStr}`;
          if (!triggeredKeysRef.current.has(triggerKey)) {
            triggeredKeysRef.current.add(triggerKey);

            const pendingCount = habits.filter(
              (h: any) => !(h.completions || []).some((c: any) => c.date === todayStr && c.completed)
            ).length;

            if (pendingCount > 0) {
              const title = "AuraHabit Streak Protection Alert 🚨";
              const body = `You still have ${pendingCount} pending habit(s) today. Check them off to keep your streak alive!`;
              sendSystemNotification(title, body, triggerKey);
            }
          }
        }
      } catch (e) {
        console.error("Notification scheduler error:", e);
      }
    };

    // Check immediately and then every 10 seconds
    checkAndTriggerNotifications();
    const interval = setInterval(checkAndTriggerNotifications, 10000);
    return () => clearInterval(interval);
  }, [status]);

  return <NotificationToastContainer />;
}
