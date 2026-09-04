"use client";

import { useEffect, useState } from "react";
import {
  Bell,
  Calendar,
  Clock,
  Plus,
  CheckCircle2,
  Circle,
  Trash2,
  Tag,
  Sparkles,
  CalendarDays,
} from "lucide-react";
import { format } from "date-fns";
import { ReminderModal } from "./ReminderModal";

interface ReminderItem {
  id: string;
  title: string;
  description?: string;
  date: string;
  time: string;
  dayOfWeek: string;
  completed: boolean;
}

export function ReminderCard() {
  const [reminders, setReminders] = useState<ReminderItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filter, setFilter] = useState<"all" | "active" | "completed">("active");

  // Live time ticker state
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    setNow(new Date());
    const timer = setInterval(() => {
      setNow(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const fetchReminders = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/reminders");
      const data = await res.json();
      if (Array.isArray(data)) {
        setReminders(data);
      }
    } catch (e) {
      console.error("Failed to load reminders", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReminders();
  }, []);

  const toggleReminder = async (item: ReminderItem) => {
    const updatedStatus = !item.completed;
    // Optimistic UI update
    setReminders((prev) =>
      prev.map((r) => (r.id === item.id ? { ...r, completed: updatedStatus } : r))
    );

    try {
      await fetch(`/api/reminders/${item.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ completed: updatedStatus }),
      });
    } catch (e) {
      console.error(e);
    }
  };

  const deleteReminder = async (id: string) => {
    setReminders((prev) => prev.filter((r) => r.id !== id));
    try {
      await fetch(`/api/reminders/${id}`, {
        method: "DELETE",
      });
    } catch (e) {
      console.error(e);
    }
  };

  const currentDayName = now ? format(now, "EEEE") : "";
  const currentDateFormatted = now ? format(now, "MMMM d, yyyy") : "";
  const currentTimeFormatted = now ? format(now, "hh:mm:ss a") : "";

  const filteredReminders = reminders.filter((r) => {
    if (filter === "active") return !r.completed;
    if (filter === "completed") return r.completed;
    return true;
  });

  return (
    <>
      <div className="glass-card p-6 relative overflow-hidden bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-teal-500/10 border-amber-500/20 shadow-md">
        {/* Background Watermark */}
        <Bell className="absolute -right-6 -bottom-6 w-40 h-40 text-amber-500/10 pointer-events-none" />

        {/* Live Date, Time & Day Header */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 pb-4 border-b border-amber-500/20">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>Smart Scheduled Reminders</span>
            </div>

            {/* Live Clock with Day of Week */}
            <div className="flex items-center gap-3 mt-1.5 flex-wrap">
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-amber-500/20 text-amber-900 dark:text-amber-200 font-extrabold text-sm border border-amber-500/30">
                <CalendarDays className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                <span>{currentDayName || "Today"}</span>
              </div>
              <div className="flex items-center gap-1.5 text-slate-800 dark:text-slate-200 font-bold text-sm">
                <Calendar className="w-4 h-4 text-emerald-500" />
                <span>{currentDateFormatted}</span>
              </div>
              <div className="flex items-center gap-1.5 text-amber-700 dark:text-amber-300 font-mono font-bold text-sm bg-white/60 dark:bg-slate-900/60 px-2.5 py-0.5 rounded-lg border border-slate-200/60 dark:border-slate-800">
                <Clock className="w-3.5 h-3.5 text-amber-500" />
                <span>{currentTimeFormatted || "Loading clock..."}</span>
              </div>
            </div>
          </div>

          {/* Action Buttons & Filter Tabs */}
          <div className="flex items-center gap-2 flex-wrap w-full lg:w-auto justify-between lg:justify-end">
            <div className="flex items-center bg-white/70 dark:bg-slate-900/70 p-1 rounded-xl border border-slate-200/80 dark:border-slate-800 text-xs">
              <button
                onClick={() => setFilter("active")}
                className={`px-2.5 py-1 rounded-lg font-semibold transition-all ${
                  filter === "active"
                    ? "bg-amber-500 text-white shadow-sm"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
                }`}
              >
                Pending ({reminders.filter((r) => !r.completed).length})
              </button>
              <button
                onClick={() => setFilter("completed")}
                className={`px-2.5 py-1 rounded-lg font-semibold transition-all ${
                  filter === "completed"
                    ? "bg-amber-500 text-white shadow-sm"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
                }`}
              >
                Done ({reminders.filter((r) => r.completed).length})
              </button>
              <button
                onClick={() => setFilter("all")}
                className={`px-2.5 py-1 rounded-lg font-semibold transition-all ${
                  filter === "all"
                    ? "bg-amber-500 text-white shadow-sm"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
                }`}
              >
                All
              </button>
            </div>

            <button
              onClick={() => setIsModalOpen(true)}
              className="px-3.5 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 active:scale-95 text-white text-xs font-bold shadow-md transition-all flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Add Reminder</span>
            </button>
          </div>
        </div>

        {/* Reminders List Section */}
        <div className="mt-4">
          {loading ? (
            <div className="py-6 text-center text-xs text-slate-400 animate-pulse">
              Loading reminders...
            </div>
          ) : filteredReminders.length === 0 ? (
            <div className="py-8 text-center bg-white/40 dark:bg-slate-900/40 rounded-xl border border-dashed border-amber-500/20">
              <Bell className="w-8 h-8 text-amber-500/40 mx-auto mb-2" />
              <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
                {filter === "active"
                  ? "No pending reminders!"
                  : filter === "completed"
                  ? "No completed reminders yet."
                  : "No reminders found."}
              </p>
              <p className="text-[11px] text-slate-500 mt-1">
                Click "+ Add Reminder" to schedule tasks with Date, Time, and Day!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[320px] overflow-y-auto pr-1">
              {filteredReminders.map((item) => (
                <div
                  key={item.id}
                  className={`p-3.5 rounded-xl border transition-all flex items-start justify-between gap-3 ${
                    item.completed
                      ? "bg-slate-100/60 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800 opacity-70"
                      : "bg-white/80 dark:bg-slate-900/80 border-amber-500/20 shadow-sm hover:shadow-md"
                  }`}
                >
                  <div className="flex items-start gap-3 overflow-hidden">
                    <button
                      onClick={() => toggleReminder(item)}
                      className="mt-0.5 text-amber-600 dark:text-amber-400 hover:scale-110 transition-transform shrink-0"
                      title={item.completed ? "Mark pending" : "Mark completed"}
                    >
                      {item.completed ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                      ) : (
                        <Circle className="w-5 h-5 text-amber-500" />
                      )}
                    </button>

                    <div className="overflow-hidden">
                      <h4
                        className={`text-xs font-bold text-slate-900 dark:text-slate-100 leading-snug truncate ${
                          item.completed ? "line-through text-slate-400 dark:text-slate-500" : ""
                        }`}
                      >
                        {item.title}
                      </h4>

                      {item.description && (
                        <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                          {item.description}
                        </p>
                      )}

                      {/* Explicit Date, Time, and Day Badges */}
                      <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                        {/* Day of Week Badge */}
                        <span className="px-2 py-0.5 rounded-md bg-amber-500/15 text-amber-800 dark:text-amber-300 font-extrabold text-[10px] flex items-center gap-1 border border-amber-500/20">
                          <Tag className="w-3 h-3 text-amber-500" />
                          {item.dayOfWeek}
                        </span>

                        {/* Date Badge */}
                        <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 font-bold text-[10px] flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-emerald-500" />
                          {item.date}
                        </span>

                        {/* Time Badge */}
                        <span className="px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-700 dark:text-blue-300 font-bold text-[10px] flex items-center gap-1">
                          <Clock className="w-3 h-3 text-blue-500" />
                          {item.time}
                        </span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => deleteReminder(item.id)}
                    className="text-slate-400 hover:text-rose-500 p-1 rounded-lg transition-colors shrink-0"
                    title="Delete Reminder"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modal Integration */}
      {isModalOpen && (
        <ReminderModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSuccess={() => {
            setIsModalOpen(false);
            fetchReminders();
          }}
        />
      )}
    </>
  );
}
