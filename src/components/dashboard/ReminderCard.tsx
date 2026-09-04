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
  Timer,
  AlertTriangle,
  Flame,
  Target,
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

interface CountdownState {
  formattedCountdown: string;
  shortText: string;
  status: "future" | "urgent" | "overdue" | "completed";
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

function calculateCountdown(dateStr: string, timeStr: string, completed: boolean): CountdownState {
  if (completed) {
    return {
      formattedCountdown: "Completed",
      shortText: "Done ✓",
      status: "completed",
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
    };
  }

  let targetDate = new Date();
  try {
    const [year, month, day] = dateStr.split("-").map(Number);
    let hours = 9;
    let minutes = 0;

    if (timeStr) {
      const timeUpper = timeStr.trim().toUpperCase();
      const isPM = timeUpper.includes("PM");
      const isAM = timeUpper.includes("AM");
      const cleanTime = timeUpper.replace(/(AM|PM)/g, "").trim();
      const parts = cleanTime.split(":");

      if (parts.length >= 2) {
        hours = parseInt(parts[0], 10) || 0;
        minutes = parseInt(parts[1], 10) || 0;
        if (isPM && hours < 12) hours += 12;
        if (isAM && hours === 12) hours = 0;
      }
    }

    targetDate = new Date(year, month - 1, day, hours, minutes, 0, 0);
  } catch (e) {
    targetDate = new Date();
  }

  const nowMs = Date.now();
  const targetMs = targetDate.getTime();
  const diffMs = targetMs - nowMs;

  if (diffMs <= 0) {
    const overdueMins = Math.floor(Math.abs(diffMs) / (1000 * 60));
    const overdueHours = Math.floor(overdueMins / 60);
    const overdueDays = Math.floor(overdueHours / 24);

    let overdueText = "Overdue";
    if (overdueDays > 0) overdueText = `Overdue by ${overdueDays}d`;
    else if (overdueHours > 0) overdueText = `Overdue by ${overdueHours}h`;
    else if (overdueMins > 0) overdueText = `Overdue by ${overdueMins}m`;

    return {
      formattedCountdown: overdueText,
      shortText: overdueText,
      status: "overdue",
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
    };
  }

  const totalSecs = Math.floor(diffMs / 1000);
  const days = Math.floor(totalSecs / (3600 * 24));
  const hours = Math.floor((totalSecs % (3600 * 24)) / 3600);
  const minutes = Math.floor((totalSecs % 3600) / 60);
  const seconds = totalSecs % 60;

  const pad = (n: number) => n.toString().padStart(2, "0");
  const formattedCountdown = `${days > 0 ? `${days}d : ` : ""}${pad(hours)}h : ${pad(minutes)}m : ${pad(seconds)}s`;

  let shortText = "";
  if (days > 0) shortText = `${days}d ${hours}h left`;
  else if (hours > 0) shortText = `${hours}h ${minutes}m left`;
  else shortText = `${minutes}m ${seconds}s left`;

  const isUrgent = totalSecs <= 86400; // Under 24 hours

  return {
    formattedCountdown,
    shortText,
    status: isUrgent ? "urgent" : "future",
    days,
    hours,
    minutes,
    seconds,
  };
}

export function ReminderCard() {
  const [reminders, setReminders] = useState<ReminderItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filter, setFilter] = useState<"all" | "active" | "completed">("active");

  // Ticking ticker state updated every second
  const [now, setNow] = useState<Date>(new Date());

  useEffect(() => {
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

  const currentDayName = format(now, "EEEE");
  const currentDateFormatted = format(now, "MMMM d, yyyy");
  const currentTimeFormatted = format(now, "hh:mm:ss a");

  const activeReminders = reminders.filter((r) => !r.completed);

  // Find top featured upcoming target
  const sortedUpcoming = [...activeReminders].sort((a, b) => {
    const countA = calculateCountdown(a.date, a.time, a.completed);
    const countB = calculateCountdown(b.date, b.time, b.completed);
    return (countA.days * 86400 + countA.hours * 3600 + countA.minutes * 60 + countA.seconds) -
           (countB.days * 86400 + countB.hours * 3600 + countB.minutes * 60 + countB.seconds);
  });

  const featuredTarget = sortedUpcoming[0];
  const featuredCountdown = featuredTarget
    ? calculateCountdown(featuredTarget.date, featuredTarget.time, featuredTarget.completed)
    : null;

  const filteredReminders = reminders.filter((r) => {
    if (filter === "active") return !r.completed;
    if (filter === "completed") return r.completed;
    return true;
  });

  return (
    <>
      <div className="glass-card p-6 relative overflow-hidden bg-gradient-to-br from-amber-500/10 via-teal-500/5 to-emerald-500/10 border-amber-500/20 shadow-md">
        {/* Background Watermark */}
        <Timer className="absolute -right-6 -bottom-6 w-40 h-40 text-amber-500/10 pointer-events-none" />

        {/* Live Date, Time & Day Header */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 pb-4 border-b border-amber-500/20">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>Goal Preparation & Countdown Reminders</span>
            </div>

            {/* Live Clock with Day of Week */}
            <div className="flex items-center gap-3 mt-1.5 flex-wrap">
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-amber-500/20 text-amber-900 dark:text-amber-200 font-extrabold text-sm border border-amber-500/30">
                <CalendarDays className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                <span>{currentDayName}</span>
              </div>
              <div className="flex items-center gap-1.5 text-slate-800 dark:text-slate-200 font-bold text-sm">
                <Calendar className="w-4 h-4 text-emerald-500" />
                <span>{currentDateFormatted}</span>
              </div>
              <div className="flex items-center gap-1.5 text-amber-700 dark:text-amber-300 font-mono font-bold text-sm bg-white/60 dark:bg-slate-900/60 px-2.5 py-0.5 rounded-lg border border-slate-200/60 dark:border-slate-800">
                <Clock className="w-3.5 h-3.5 text-amber-500" />
                <span>{currentTimeFormatted}</span>
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
                Active ({reminders.filter((r) => !r.completed).length})
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
              <span>Add Target</span>
            </button>
          </div>
        </div>

        {/* Featured Live Goal Preparation Hero Banner */}
        {featuredTarget && featuredCountdown && featuredCountdown.status !== "overdue" && (
          <div className="mt-4 p-4 rounded-2xl bg-gradient-to-r from-amber-500/20 via-orange-500/15 to-emerald-500/20 border border-amber-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-inner">
            <div>
              <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-amber-700 dark:text-amber-300">
                <Flame className="w-4 h-4 text-orange-500 animate-bounce" />
                <span>Next Upcoming Goal Preparation Target</span>
              </div>
              <h3 className="text-base font-extrabold text-slate-900 dark:text-slate-100 mt-0.5">
                {featuredTarget.title}
              </h3>
              <p className="text-xs text-slate-500 flex items-center gap-2 mt-0.5">
                <span>{featuredTarget.dayOfWeek}, {featuredTarget.date}</span>
                <span>•</span>
                <span>{featuredTarget.time}</span>
              </p>
            </div>

            {/* Live Ticking Countdown Counter */}
            <div className="px-4 py-2 rounded-xl bg-slate-900 text-amber-400 border border-amber-500/40 font-mono font-extrabold text-sm sm:text-base flex items-center gap-2 shrink-0 shadow-lg">
              <Timer className="w-4 h-4 text-amber-400 animate-spin-slow" />
              <span>{featuredCountdown.formattedCountdown}</span>
            </div>
          </div>
        )}

        {/* Reminders List Section with Live Remaining Time Badges */}
        <div className="mt-4">
          {loading ? (
            <div className="py-6 text-center text-xs text-slate-400 animate-pulse">
              Loading preparation targets & reminders...
            </div>
          ) : filteredReminders.length === 0 ? (
            <div className="py-8 text-center bg-white/40 dark:bg-slate-900/40 rounded-xl border border-dashed border-amber-500/20">
              <Timer className="w-8 h-8 text-amber-500/40 mx-auto mb-2" />
              <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
                {filter === "active"
                  ? "No active preparation targets or reminders!"
                  : filter === "completed"
                  ? "No completed targets yet."
                  : "No reminders found."}
              </p>
              <p className="text-[11px] text-slate-500 mt-1">
                Click "+ Add Target" to schedule goal timers with live remaining countdowns!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[340px] overflow-y-auto pr-1">
              {filteredReminders.map((item) => {
                const countdown = calculateCountdown(item.date, item.time, item.completed);

                return (
                  <div
                    key={item.id}
                    className={`p-3.5 rounded-xl border transition-all flex items-start justify-between gap-3 ${
                      item.completed
                        ? "bg-slate-100/60 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800 opacity-70"
                        : countdown.status === "urgent"
                        ? "bg-amber-500/10 dark:bg-amber-950/20 border-amber-500/40 shadow-sm"
                        : countdown.status === "overdue"
                        ? "bg-rose-500/10 dark:bg-rose-950/20 border-rose-500/30"
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

                        {/* Date, Time, Day, and Live Remaining Time Ticker */}
                        <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                          {/* Live Countdown Badge */}
                          <span
                            className={`px-2 py-0.5 rounded-md font-mono font-extrabold text-[10px] flex items-center gap-1 border ${
                              item.completed
                                ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                                : countdown.status === "urgent"
                                ? "bg-amber-500/20 text-amber-900 dark:text-amber-200 border-amber-500/40 animate-pulse"
                                : countdown.status === "overdue"
                                ? "bg-rose-500/20 text-rose-700 dark:text-rose-300 border-rose-500/30"
                                : "bg-teal-500/15 text-teal-800 dark:text-teal-300 border-teal-500/20"
                            }`}
                          >
                            {countdown.status === "urgent" ? (
                              <AlertTriangle className="w-3 h-3 text-amber-500" />
                            ) : (
                              <Timer className="w-3 h-3 text-emerald-500" />
                            )}
                            {countdown.formattedCountdown}
                          </span>

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
                      title="Delete Target"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                );
              })}
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
