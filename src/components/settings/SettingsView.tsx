"use client";

import { useState, useEffect } from "react";
import {
  Sun,
  Moon,
  Monitor,
  Clock,
  Bell,
  BellOff,
  Send,
  CheckCircle2,
  AlertCircle,
  Smartphone,
  Sparkles,
  Loader2,
  Volume2,
} from "lucide-react";
import { useTheme } from "@/components/providers/ThemeProvider";
import { emitInAppToast } from "@/components/providers/NotificationToast";

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export function SettingsView({ habits, goals, plannerTasks }: { habits?: any[]; goals?: any[]; plannerTasks?: any[] } = {}) {
  const { theme, setTheme } = useTheme();
  const [showTimeSlots, setShowTimeSlots] = useState(false);
  const [reminderNotifications, setReminderNotifications] = useState(true);
  const [browserPermission, setBrowserPermission] = useState<string>("default");
  const [isSubscribingPush, setIsSubscribingPush] = useState(false);
  const [isTestingPush, setIsTestingPush] = useState(false);
  const [isSavingSettings, setIsSavingSettings] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    // Load initial settings
    fetch("/api/settings")
      .then((r) => r.json())
      .then((d) => {
        if (d) {
          if (typeof d.showTimeSlots === "boolean") setShowTimeSlots(d.showTimeSlots);
          if (typeof d.reminderNotifications === "boolean") setReminderNotifications(d.reminderNotifications);
        }
      })
      .catch(() => {});

    // Check browser notification permission status
    if (typeof window !== "undefined" && "Notification" in window) {
      setBrowserPermission(Notification.permission);
    } else {
      setBrowserPermission("unsupported");
    }
  }, []);

  const handleToggleReminderNotifications = async (val: boolean) => {
    setReminderNotifications(val);
    setIsSavingSettings(true);
    setStatusMessage(null);

    try {
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reminderNotifications: val }),
      });

      if (res.ok) {
        setStatusMessage({
          type: "success",
          text: val ? "Daily habit reminder notifications turned ON!" : "Daily habit reminder notifications turned OFF.",
        });
        emitInAppToast(
          val ? "Notifications Enabled 🔔" : "Notifications Muted 🔇",
          val ? "You will receive automated daily reminders for your scheduled habits." : "Automated daily habit reminders have been turned off."
        );
      }
    } catch (e: any) {
      console.error(e);
      setStatusMessage({ type: "error", text: "Failed to update notification preference." });
    } finally {
      setIsSavingSettings(false);
    }
  };

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

  const handleEnableWebPush = async () => {
    if (typeof window === "undefined" || !("Notification" in window)) {
      setStatusMessage({ type: "error", text: "Web notifications are not supported on this browser." });
      return;
    }

    setIsSubscribingPush(true);
    setStatusMessage(null);

    try {
      const permission = await Notification.requestPermission();
      setBrowserPermission(permission);

      if (permission !== "granted") {
        setStatusMessage({
          type: "error",
          text: "Browser notification permission denied. Please allow notifications in browser site settings.",
        });
        setIsSubscribingPush(false);
        return;
      }

      if (!("serviceWorker" in navigator)) {
        setStatusMessage({ type: "error", text: "Service Worker is not supported by your browser." });
        setIsSubscribingPush(false);
        return;
      }

      const registration = await navigator.serviceWorker.register("/sw.js");
      await navigator.serviceWorker.ready;

      const publicKey =
        process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ||
        "BF2mwhYFvnkCk2K9b8SBfu5l2KwzJ2T8ugWAWIHr_PssXJCUlsrpQlEn6yBCq2BQjNItim9uRqSOIek4Ar2CTQc";

      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicKey),
      });

      const res = await fetch("/api/notifications/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subscription }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setStatusMessage({
          type: "success",
          text: "Browser web push notifications registered successfully! 🚀",
        });
        emitInAppToast("Web Push Activated! 🎉", "Your device is now subscribed to receive instant habit push alerts.");
      } else {
        throw new Error(data.error || "Failed to save push subscription.");
      }
    } catch (e: any) {
      console.error("Push subscription error:", e);
      setStatusMessage({ type: "error", text: e.message || "Failed to enable Web Push notifications." });
    } finally {
      setIsSubscribingPush(false);
    }
  };

  const handleSendTestPush = async () => {
    setIsTestingPush(true);
    setStatusMessage(null);

    try {
      const res = await fetch("/api/notifications/send-push", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: "AuraHabit Test Alert ⚡",
          body: "Great job! Web Push notifications are working perfectly on this device.",
          url: "/settings",
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setStatusMessage({ type: "success", text: "Test push notification dispatched!" });
        emitInAppToast("Test Push Sent 🚀", "Check your system tray or browser notification banner!");
      } else {
        setStatusMessage({
          type: "error",
          text: data.message || data.error || "No active push subscription found. Enable Web Push first!",
        });
      }
    } catch (e: any) {
      console.error("Test push error:", e);
      setStatusMessage({ type: "error", text: "Failed to dispatch test push notification." });
    } finally {
      setIsTestingPush(false);
    }
  };

  const handleTestInAppToast = () => {
    emitInAppToast(
      "In-App Toast Notification 🔔",
      "This is a live preview of AuraHabit's in-app banner toast system."
    );
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Feedback Message Banner */}
      {statusMessage && (
        <div
          className={`p-4 rounded-xl border flex items-center gap-3 text-sm font-medium animate-in fade-in slide-in-from-top-2 duration-200 ${
            statusMessage.type === "success"
              ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400"
              : "bg-rose-500/10 border-rose-500/30 text-rose-600 dark:text-rose-400"
          }`}
        >
          {statusMessage.type === "success" ? (
            <CheckCircle2 className="w-5 h-5 shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 shrink-0" />
          )}
          <span>{statusMessage.text}</span>
        </div>
      )}

      {/* Main Notification & Reminder System Settings Card */}
      <div className="glass-card p-6 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm">
        <div className="flex items-center justify-between gap-4 mb-2">
          <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Bell className="w-5 h-5 text-emerald-500" />
            Notification & Daily Reminder Preferences
          </h2>

          <span
            className={`text-xs font-semibold px-3 py-1 rounded-full border flex items-center gap-1.5 ${
              reminderNotifications
                ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400"
                : "bg-amber-500/10 border-amber-500/30 text-amber-600 dark:text-amber-400"
            }`}
          >
            {reminderNotifications ? (
              <>
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Notifications Active
              </>
            ) : (
              <>
                <BellOff className="w-3.5 h-3.5" />
                Notifications Muted
              </>
            )}
          </span>
        </div>

        <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">
          Manage system-wide daily reminder alerts, web push permissions, and in-app toasts for scheduled habit tracking.
        </p>

        <div className="space-y-4">
          {/* Master Toggle: Daily Habit Reminders */}
          <div className="flex items-center justify-between p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 hover:bg-slate-100/50 dark:hover:bg-slate-800/50 transition-colors">
            <div className="flex items-start gap-3">
              <div className={`p-2.5 rounded-xl mt-0.5 ${reminderNotifications ? "bg-emerald-500/10 text-emerald-500" : "bg-slate-200 dark:bg-slate-800 text-slate-400"}`}>
                {reminderNotifications ? <Bell className="w-5 h-5" /> : <BellOff className="w-5 h-5" />}
              </div>
              <div>
                <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  Habit & Daily Reminders
                  {isSavingSettings && <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-500" />}
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {reminderNotifications
                    ? "Automated daily habit reminder alerts are enabled for your scheduled habit time slots."
                    : "Notifications are muted. You won't receive push alerts or reminder toasts."}
                </p>
              </div>
            </div>

            <label className="relative inline-flex items-center cursor-pointer shrink-0 ml-4">
              <input
                type="checkbox"
                checked={reminderNotifications}
                onChange={(e) => handleToggleReminderNotifications(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
            </label>
          </div>

          {/* Web Push Browser Permission & Registration */}
          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-3">
              <div className="flex items-start gap-3">
                <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-500 shrink-0 mt-0.5">
                  <Smartphone className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2">
                    Browser Web Push Notifications
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Receive push notifications directly on your browser or device even when AuraHabit is in the background.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                <span
                  className={`text-[11px] font-bold px-2.5 py-1 rounded-md capitalize ${
                    browserPermission === "granted"
                      ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30"
                      : browserPermission === "denied"
                      ? "bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/30"
                      : "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30"
                  }`}
                >
                  Permission: {browserPermission}
                </span>

                <button
                  onClick={handleEnableWebPush}
                  disabled={isSubscribingPush || browserPermission === "denied"}
                  className="px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-semibold text-xs transition-colors flex items-center gap-1.5 disabled:opacity-50"
                >
                  {isSubscribingPush ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Sparkles className="w-3.5 h-3.5" />
                  )}
                  {browserPermission === "granted" ? "Re-subscribe Web Push" : "Enable Web Push"}
                </button>
              </div>
            </div>
          </div>

          {/* Test Notification Actions */}
          <div className="pt-2 grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              onClick={handleSendTestPush}
              disabled={isTestingPush || !reminderNotifications}
              className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-emerald-500/50 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 text-xs font-bold transition-all flex items-center justify-center gap-2 hover:shadow-sm disabled:opacity-50"
            >
              {isTestingPush ? (
                <Loader2 className="w-4 h-4 animate-spin text-emerald-500" />
              ) : (
                <Send className="w-4 h-4 text-emerald-500" />
              )}
              <span>Send Test Push Notification</span>
            </button>

            <button
              onClick={handleTestInAppToast}
              className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-purple-500/50 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 text-xs font-bold transition-all flex items-center justify-center gap-2 hover:shadow-sm"
            >
              <Volume2 className="w-4 h-4 text-purple-500" />
              <span>Preview In-App Banner Toast</span>
            </button>
          </div>
        </div>
      </div>

      {/* Yearly Matrix Time Slots Setting */}
      <div className="glass-card p-6 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm">
        <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2 mb-2">
          <Clock className="w-5 h-5 text-purple-500" />
          Yearly Matrix Grid Time Slots Display
        </h2>
        <p className="text-xs text-slate-500 mb-4">Enable to display an optional Time Slot column (target daily duration/time e.g., "From 08:00 To 09:00") next to habits in the Yearly Matrix Grid.</p>

        <div className="flex items-center justify-between p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
          <div className="flex items-center gap-3">
            <Clock className="w-5 h-5 text-purple-500" />
            <div>
              <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100">Display Habit Time Slots Column</h4>
              <p className="text-xs text-slate-500">Show scheduled time duration for each habit in grid views</p>
            </div>
          </div>

          <label className="relative inline-flex items-center cursor-pointer shrink-0 ml-4">
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
      <div className="glass-card p-6 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm">
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
    </div>
  );
}
