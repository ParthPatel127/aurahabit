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
  return null;
}
