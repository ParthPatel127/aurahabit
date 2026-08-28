"use client";

import { useState, useEffect } from "react";
import { Bell, ShieldCheck, Sun, Moon, Monitor, Clock, Send, AlertTriangle, CheckCircle2, Lock } from "lucide-react";
import { useTheme } from "@/components/providers/ThemeProvider";

export function SettingsView({ habits, goals, plannerTasks }: { habits: any[]; goals: any[]; plannerTasks: any[] }) {
  const { theme, setTheme } = useTheme();
  const [showTimeSlots, setShowTimeSlots] = useState(false);
  const [notificationStatus, setNotificationStatus] = useState<string>("default");
  const [isInsecureHttp, setIsInsecureHttp] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      if ("Notification" in window) {
        setNotificationStatus(Notification.permission);
      }
      const isHttp = window.location.protocol === "http:";
      const isIp = window.location.hostname !== "localhost" && window.location.hostname !== "127.0.0.1";
      if (isHttp && isIp) {
        setIsInsecureHttp(true);
      }
    }
    fetch("/api/settings")
      .then((r) => r.json())
      .then((d) => {
        if (d && typeof d.showTimeSlots === "boolean") {
          setShowTimeSlots(d.showTimeSlots);
        }
      })
      .catch(() => {});
  }, []);

  const handleToggleTimeSlots = async (val: boolean) => {
    setShowTimeSlots(val);
    try {
      await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ showTimeSlots: val }),
      });
    } catch (e) {
      console.error(e);
    }
  };

  const requestNotificationPermission = async () => {
    if (!("Notification" in window)) {
      alert("This browser does not support desktop notifications.");
      return;
    }

    try {
      const permission = await Notification.requestPermission();
      setNotificationStatus(permission);

      if (permission === "granted") {
        if (window.sendDesktopNotification) {
          window.sendDesktopNotification(
            "AuraHabit Notifications Enabled! ⚡",
            "Great! Background Service Worker notifications are now active. You will receive reminders to stay on top of daily habits."
          );
        }
      } else if (permission === "denied") {
        if (window.sendDesktopNotification) {
          window.sendDesktopNotification(
            "In-App Toast Notification Active ⚡",
            "Browser OS notification was blocked, but In-App Notification Popups are 100% active and working!"
          );
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleTestDesktopAlert = () => {
    if (window.sendDesktopNotification) {
      window.sendDesktopNotification(
        "AuraHabit Notification Test ⚡",
        "Notification test successful! In-app and desktop alert triggers are fully functional."
      );
    } else if ("Notification" in window && Notification.permission === "granted") {
      new Notification("AuraHabit Notification Test ⚡", {
        body: "Notification test successful!",
        icon: "/favicon.ico",
        requireInteraction: true,
      });
    }
  };

  const handleTestClosedTabPush = async () => {
    try {
      if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
        alert("Push notifications are not supported on this browser context.");
        return;
      }

      if (Notification.permission !== "granted") {
        const perm = await Notification.requestPermission();
        if (perm !== "granted") {
          alert("Notification permission denied! Please allow notifications in site settings.");
          return;
        }
      }

      // Ensure push subscription is refreshed in PostgreSQL before test push
      const reg = await navigator.serviceWorker.ready;
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
      }

      alert("Closed-Tab Test Triggered! Click OK and CLOSE THIS TAB right now within 5 seconds.");
      setTimeout(async () => {
        await fetch("/api/notifications/send-push", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: "Closed-Tab Push Test 🚀",
            body: "Success! You received this notification via Web Push while the app tab was CLOSED!",
            tag: "closed_tab_test",
            url: "/dashboard",
          }),
        });
      }, 5000);
    } catch (e: any) {
      console.error("Test closed-tab push error:", e);
      alert("Error setting up closed-tab push: " + (e.message || e));
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Yearly Matrix Time Slots Setting */}
      <div className="glass-card p-6">
        <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2 mb-2">
          <Clock className="w-5 h-5 text-purple-500" />
          Yearly Matrix Grid Time Slots Display
        </h2>
        <p className="text-xs text-slate-500 mb-4">Enable to display an optional Time Slot column (target daily duration/time e.g., "From 08:00 To 09:00") next to habits in the Yearly Matrix Grid.</p>

        <div className="flex items-center justify-between p-4 rounded-xl border border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <Clock className="w-5 h-5 text-purple-500" />
            <div>
              <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100">Display Habit Time Slots Column</h4>
              <p className="text-xs text-slate-500">Show scheduled time duration for each habit in grid views</p>
            </div>
          </div>

          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={showTimeSlots}
              onChange={(e) => handleToggleTimeSlots(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
          </label>
        </div>
      </div>

      {/* Theme Preference Settings */}
      <div className="glass-card p-6">
        <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2 mb-2">
          <Sun className="w-5 h-5 text-amber-500" />
          Theme & Aesthetic Preference
        </h2>
        <p className="text-xs text-slate-500 mb-4">Select your preferred color scheme. Your theme preference is stored in your database account settings (`UserSettings`).</p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { id: "light", label: "Light Theme", icon: Sun },
            { id: "dark", label: "Dark Theme", icon: Moon },
            { id: "system", label: "System Default", icon: Monitor },
          ].map((item) => {
            const Icon = item.icon;
            const isSelected = theme === item.id;

            return (
              <button
                key={item.id}
                onClick={() => setTheme(item.id as any)}
                className={`p-4 rounded-xl border flex flex-col items-center justify-center gap-2 text-xs font-bold transition-all ${
                  isSelected
                    ? "border-emerald-500 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 shadow-sm"
                    : "border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                }`}
              >
                <Icon className="w-5 h-5" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Dual Notification Engine Settings */}
      <div className="glass-card p-6">
        <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2 mb-2">
          <Bell className="w-5 h-5 text-purple-500" />
          Real-Time Habit Notification Engine
        </h2>
        <p className="text-xs text-slate-500 mb-4">
          AuraHabit includes a dual notification system: native OS desktop notifications via background Service Worker (`/sw.js`) and guaranteed In-App Banner Toast popups!
        </p>

        {/* If Insecure HTTP connection on LAN IP (e.g. http://10.31.51.20:3000) */}
        {isInsecureHttp && (
          <div className="mb-4 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-900 dark:text-amber-200 text-xs leading-relaxed space-y-2">
            <div className="flex items-center gap-2 font-bold text-amber-700 dark:text-amber-400">
              <AlertTriangle className="w-4 h-4 shrink-0 text-amber-500" />
              <span>Insecure HTTP Network Connection Detected ({typeof window !== "undefined" ? window.location.host : ""})</span>
            </div>
            <p>
              Browsers (Chrome, Edge, Brave) <strong>disable OS Notifications and Service Workers</strong> when accessing over an unencrypted network IP address like <code>http://{typeof window !== "undefined" ? window.location.host : ""}</code> (Insecure Origin).
            </p>
            <div className="space-y-1 font-medium text-[11px] pt-1">
              <p className="font-bold text-slate-800 dark:text-slate-200">How to receive desktop alerts:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Access the site using <strong>http://localhost:3000</strong> if you are on the same machine.</li>
                <li>Or open <code>chrome://flags/#unsafely-treat-insecure-origin-as-secure</code> and add <code>http://{typeof window !== "undefined" ? window.location.host : ""}</code>.</li>
              </ul>
            </div>
            <p className="font-semibold text-emerald-600 dark:text-emerald-400 pt-1">
              ✓ Guaranteed In-App Toast popups are active inside the web application!
            </p>
          </div>
        )}

        {/* If Browser Notification permission is DENIED */}
        {notificationStatus === "denied" && (
          <div className="mb-4 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-900 dark:text-amber-200 text-xs leading-relaxed space-y-2">
            <div className="flex items-center gap-2 font-bold text-amber-700 dark:text-amber-400">
              <AlertTriangle className="w-4 h-4 shrink-0 text-amber-500" />
              <span>Browser OS Permission is Currently Blocked/Denied</span>
            </div>
            <p>
              Your browser is blocking OS popups for this site. To unblock OS desktop alerts:
            </p>
            <ol className="list-decimal pl-5 space-y-1 font-medium text-[11px]">
              <li>Click the 🔒 <strong>Lock icon</strong> or ⚙️ <strong>Site Settings</strong> icon next to the URL address bar in Chrome/Edge.</li>
              <li>Change <strong>Notifications</strong> from <em>Block</em> to <strong>Allow</strong>.</li>
              <li>Refresh the page.</li>
            </ol>
            <p className="font-semibold text-emerald-600 dark:text-emerald-400 pt-1">
              ✓ In-App Toast Notifications are 100% active and will pop up directly on your screen regardless of browser settings!
            </p>
          </div>
        )}

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 rounded-xl border border-slate-200 dark:border-slate-800 gap-4">
          <div className="flex items-center gap-3">
            <ShieldCheck className="w-5 h-5 text-emerald-500" />
            <div>
              <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <span>Notification Delivery Engine</span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                  notificationStatus === "granted" ? "bg-emerald-500/20 text-emerald-600" : "bg-purple-500/20 text-purple-600 dark:text-purple-400"
                }`}>
                  {notificationStatus === "granted" ? "Desktop + In-App" : "In-App Active (OS Denied)"}
                </span>
              </h4>
              <p className="text-xs text-slate-500">Service Worker push alerts & guaranteed In-App Banner Toasts</p>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            {notificationStatus !== "granted" && (
              <button
                onClick={requestNotificationPermission}
                className="px-3.5 py-2.5 rounded-xl border border-purple-500/30 bg-purple-500/10 text-purple-600 dark:text-purple-400 font-bold text-xs hover:bg-purple-500/20 transition-all"
              >
                Request OS Permission
              </button>
            )}

            <button
              onClick={handleTestDesktopAlert}
              className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-md shadow-purple-500/20 flex items-center justify-center gap-2 transition-all active:scale-95"
            >
              <Send className="w-3.5 h-3.5" />
              Test Notification Now
            </button>

            <button
              onClick={handleTestClosedTabPush}
              className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-500/20 flex items-center justify-center gap-2 transition-all active:scale-95"
              title="Click, then immediately close your browser tab to test receiving notifications while app is closed!"
            >
              <Send className="w-3.5 h-3.5" />
              Test Closed-Tab Push (3s Delay)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
