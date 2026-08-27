"use client";

import { useState, useEffect } from "react";
import { Bell, X, Clock, CheckCircle2 } from "lucide-react";

export interface ToastNotice {
  id: string;
  title: string;
  body: string;
  timestamp: string;
}

// Global Event Emitter for In-App Toasts
type Listener = (toast: ToastNotice) => void;
const listeners: Set<Listener> = new Set();

export function emitInAppToast(title: string, body: string) {
  const toast: ToastNotice = {
    id: Math.random().toString(36).substring(2, 9),
    title,
    body,
    timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
  };
  listeners.forEach((l) => l(toast));
}

export function NotificationToastContainer() {
  const [toasts, setToasts] = useState<ToastNotice[]>([]);

  useEffect(() => {
    const handleAddToast = (toast: ToastNotice) => {
      setToasts((prev) => [toast, ...prev.slice(0, 4)]);

      // Auto dismiss after 8 seconds
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== toast.id));
      }, 8000);
    };

    listeners.add(handleAddToast);
    return () => {
      listeners.delete(handleAddToast);
    };
  }, []);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-5 right-5 z-[10000] flex flex-col gap-2.5 max-w-sm w-full pointer-events-auto">
      {toasts.map((t) => (
        <div
          key={t.id}
          className="bg-slate-900 text-white border border-emerald-500/40 rounded-2xl p-4 shadow-2xl flex items-start gap-3 animate-in fade-in slide-in-from-top-5 duration-200"
        >
          <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 shrink-0 mt-0.5">
            <Bell className="w-5 h-5 animate-bounce" />
          </div>

          <div className="flex-1 overflow-hidden">
            <div className="flex items-center justify-between gap-1 mb-0.5">
              <h4 className="font-bold text-xs text-emerald-400 truncate">{t.title}</h4>
              <span className="text-[10px] text-slate-400 shrink-0">{t.timestamp}</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">{t.body}</p>
          </div>

          <button
            onClick={() => setToasts((prev) => prev.filter((item) => item.id !== t.id))}
            className="text-slate-400 hover:text-white p-1 shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
}
