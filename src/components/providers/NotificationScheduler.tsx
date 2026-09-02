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
  const { data: session } = useSession();

  useEffect(() => {
    window.sendDesktopNotification = (title: string, body: string) => {
      if ("Notification" in window && Notification.permission === "granted") {
        try {
          new Notification(title, {
            body,
            icon: "/icons/icon-192.png",
          });
        } catch (e) {
          console.error("Desktop notification failed:", e);
        }
      }
    };
  }, []);

  return <NotificationToastContainer />;
}
