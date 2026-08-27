"use client";

import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { Flame, Edit3, Archive, Trash2, Copy, MoreVertical, Clock, X, Check, Calendar, GripVertical } from "lucide-react";
import { HabitModal } from "./HabitModal";
import { calculateHabitStats, formatDate } from "@/lib/utils";

interface HabitCardProps {
  habit: any;
  onRefresh: () => void;
  draggableProps?: any;
  activeDateTab?: string;
}

export function HabitCard({ habit, onRefresh, draggableProps, activeDateTab }: HabitCardProps) {
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isTimeModalOpen, setIsTimeModalOpen] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [showHoverPopup, setShowHoverPopup] = useState(false);
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  const menuContainerRef = useRef<HTMLDivElement>(null);

  const todayStr = formatDate();
  const targetDate = activeDateTab || todayStr;

  const [reminderTime, setReminderTime] = useState(habit.reminderTime || "");
  const [startTime, setStartTime] = useState(habit.startTime || "");
  const [endTime, setEndTime] = useState(habit.endTime || "");

  const stats = calculateHabitStats(habit.completions || []);
  const isDoneForDate = (habit.completions || []).some(
    (c: any) => c.date === targetDate && c.completed
  );

  useEffect(() => {
    setMounted(true);
  }, []);

  // Sync state when habit updates
  useEffect(() => {
    setReminderTime(habit.reminderTime || "");
    setStartTime(habit.startTime || "");
    setEndTime(habit.endTime || "");
  }, [habit]);

  // Click outside listener for 3-dots menu
  useEffect(() => {
    if (!showMenu) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (menuContainerRef.current && !menuContainerRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showMenu]);

  // Escape key listener for Quick Time modal dismissal
  useEffect(() => {
    if (!isTimeModalOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsTimeModalOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isTimeModalOpen]);

  const handleToggleCheckin = async () => {
    setLoading(true);
    try {
      await fetch("/api/habits/completions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          habitId: habit.id,
          date: targetDate,
          completed: !isDoneForDate,
        }),
      });
      onRefresh();
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveTime = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    let timeSlot = habit.timeSlot;
    if (startTime && endTime) {
      timeSlot = `From ${startTime} To ${endTime}`;
    }

    try {
      await fetch(`/api/habits/${habit.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reminderTime: reminderTime || null,
          startTime: startTime || null,
          endTime: endTime || null,
          timeSlot: timeSlot || null,
        }),
      });
      setIsTimeModalOpen(false);
      onRefresh();
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleArchive = async () => {
    setLoading(true);
    try {
      await fetch(`/api/habits/${habit.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ archived: !habit.archived }),
      });
      onRefresh();
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleDuplicate = async () => {
    setLoading(true);
    try {
      await fetch("/api/habits", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: `${habit.name} (Copy)`,
          categoryId: habit.categoryId,
          color: habit.color,
          icon: habit.icon,
          frequency: habit.frequency,
          scheduleDays: habit.scheduleDays,
          targetDays: habit.targetDays,
          reminderTime: habit.reminderTime,
          startTime: habit.startTime,
          endTime: habit.endTime,
          timeSlot: habit.timeSlot,
          description: habit.description,
        }),
      });
      onRefresh();
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm(`Are you sure you want to delete "${habit.name}"?`)) return;
    setLoading(true);
    try {
      await fetch(`/api/habits/${habit.id}`, {
        method: "DELETE",
      });
      onRefresh();
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const displayTimeSlot = habit.startTime && habit.endTime
    ? `From ${habit.startTime} To ${habit.endTime}`
    : habit.timeSlot || "";

  return (
    <>
      <div
        {...draggableProps}
        className={`glass-card p-5 relative flex flex-col justify-between border border-slate-200/80 dark:border-slate-800 transition-all duration-200 cursor-grab active:cursor-grabbing ${showMenu ? "z-30 shadow-2xl" : "z-10 hover:z-20 hover:shadow-md"}`}
      >
        <div>
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2 overflow-hidden">
              <GripVertical className="w-4 h-4 text-slate-400 shrink-0 cursor-grab opacity-60 hover:opacity-100" />
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold shadow-md shrink-0"
                style={{ backgroundColor: habit.color || "#10B981" }}
              >
                🎯
              </div>
              <div className="overflow-hidden">
                <h3 className="font-bold text-base text-slate-900 dark:text-slate-100 truncate">
                  {habit.name}
                </h3>
                {habit.category && (
                  <span
                    className="text-[10px] font-bold px-2 py-0.5 rounded-full inline-block mt-0.5 truncate"
                    style={{
                      backgroundColor: `${habit.category.color}20`,
                      color: habit.category.color,
                    }}
                  >
                    {habit.category.name}
                  </span>
                )}
              </div>
            </div>

            {/* 3-Dots Dropdown Menu */}
            <div className="relative" ref={menuContainerRef}>
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 transition-colors"
                title="Options"
              >
                <MoreVertical className="w-4 h-4" />
              </button>

              {showMenu && (
                <div
                  className="absolute right-0 top-8 w-40 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl z-50 py-1.5 text-xs animate-in fade-in zoom-in-95 duration-100"
                  onClick={() => setShowMenu(false)}
                >
                  <button
                    onClick={() => setIsTimeModalOpen(true)}
                    className="w-full text-left px-3 py-2 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2 font-medium text-purple-600 dark:text-purple-400"
                  >
                    <Clock className="w-3.5 h-3.5" /> Set Habit Time
                  </button>
                  <button
                    onClick={() => setIsEditOpen(true)}
                    className="w-full text-left px-3 py-2 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2 font-medium text-slate-700 dark:text-slate-300"
                  >
                    <Edit3 className="w-3.5 h-3.5" /> Edit Habit
                  </button>
                  <button
                    onClick={handleDuplicate}
                    className="w-full text-left px-3 py-2 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2 font-medium text-slate-700 dark:text-slate-300"
                  >
                    <Copy className="w-3.5 h-3.5" /> Duplicate
                  </button>
                  <button
                    onClick={handleArchive}
                    className="w-full text-left px-3 py-2 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2 font-medium text-slate-700 dark:text-slate-300"
                  >
                    <Archive className="w-3.5 h-3.5" /> {habit.archived ? "Restore" : "Archive"}
                  </button>
                  <div className="my-1 border-t border-slate-100 dark:border-slate-800" />
                  <button
                    onClick={handleDelete}
                    className="w-full text-left px-3 py-2 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-rose-600 font-medium flex items-center gap-2"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Delete Habit
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Time Slot Badge & Hover Tooltip Popup */}
          <div className="mt-3 relative">
            <div
              onMouseEnter={() => setShowHoverPopup(true)}
              onMouseLeave={() => setShowHoverPopup(false)}
              className="inline-block"
            >
              <button
                onClick={() => setIsTimeModalOpen(true)}
                className="px-2.5 py-1 rounded-lg bg-purple-500/10 border border-purple-500/20 hover:bg-purple-500/20 text-purple-700 dark:text-purple-300 text-[11px] font-bold flex items-center gap-1.5 transition-all"
              >
                <Clock className="w-3.5 h-3.5 text-purple-500" />
                <span>
                  {displayTimeSlot || habit.reminderTime
                    ? `${displayTimeSlot ? `⏱️ ${displayTimeSlot}` : ''} ${habit.reminderTime ? `(⏰ ${habit.reminderTime})` : ''}`
                    : "+ Set Time (From ➔ To)"}
                </span>
              </button>

              {showHoverPopup && !isTimeModalOpen && (
                <div className="absolute left-0 bottom-full mb-2 w-64 p-3 rounded-xl bg-slate-900 text-white text-xs shadow-2xl z-50 border border-purple-500/30 animate-in fade-in zoom-in-95 pointer-events-none">
                  <div className="flex items-center gap-2 mb-1.5 pb-1 border-b border-slate-800">
                    <Clock className="w-4 h-4 text-purple-400" />
                    <span className="font-bold text-slate-100">{habit.name} Schedule</span>
                  </div>
                  <div className="space-y-1 text-[11px] text-slate-300">
                    <p><span className="font-bold text-purple-400">Time Slot:</span> {displayTimeSlot || "Not set"}</p>
                    <p><span className="font-bold text-amber-400">Reminder Time:</span> {habit.reminderTime ? `⏰ ${habit.reminderTime}` : "No alert time"}</p>
                    <p><span className="font-bold text-emerald-400">Current Streak:</span> {stats.currentStreak} Days</p>
                    <p><span className="font-bold text-teal-400">Completion Rate:</span> {stats.completionRate}%</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {habit.description && (
            <p className="text-xs text-slate-500 mt-2 line-clamp-2">{habit.description}</p>
          )}
        </div>

        <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
          <div className="flex items-center gap-1 text-xs font-bold text-amber-500">
            <Flame className="w-4 h-4 fill-amber-500/20" />
            <span>{stats.currentStreak} d</span>
          </div>

          {/* Quick Check-In Button */}
          <button
            onClick={handleToggleCheckin}
            disabled={loading}
            className={`px-3 py-1 rounded-xl text-xs font-bold transition-all flex items-center gap-1 ${
              isDoneForDate
                ? "bg-emerald-600 text-white shadow-sm"
                : "bg-slate-100 dark:bg-slate-800 hover:bg-emerald-500/20 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
            }`}
          >
            <Check className="w-3.5 h-3.5 stroke-[3]" />
            <span>{isDoneForDate ? "Done ✓" : "Check In"}</span>
          </button>

          <div className="text-xs font-bold text-slate-500 dark:text-slate-400">
            {stats.completionRate}%
          </div>
        </div>
      </div>

      {/* Quick Set Habit Time Modal using React Portal for true full-screen viewport rendering */}
      {isTimeModalOpen && mounted && createPortal(
        <div
          className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-100"
          onClick={() => setIsTimeModalOpen(false)}
        >
          <div
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-sm p-6 shadow-2xl relative animate-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setIsTimeModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
              title="Close (Esc)"
            >
              <X className="w-4 h-4" />
            </button>

            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2 mb-1">
              <Clock className="w-5 h-5 text-purple-500" />
              Set Schedule for "{habit.name}"
            </h3>
            <p className="text-xs text-slate-500 mb-4">Set specific alert times and From/To duration slots.</p>

            <form onSubmit={handleSaveTime} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Daily Reminder Alert Time
                </label>
                <input
                  type="time"
                  value={reminderTime}
                  onChange={(e) => setReminderTime(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-sm"
                />
              </div>

              <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/20 space-y-2">
                <span className="block text-xs font-bold text-purple-700 dark:text-purple-300">
                  Time Slot Schedule (From ➔ To)
                </span>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-[10px] text-slate-500 block mb-0.5">From Time</span>
                    <input
                      type="time"
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block mb-0.5">To Time</span>
                    <input
                      type="time"
                      value={endTime}
                      onChange={(e) => setEndTime(e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsTimeModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl shadow-md transition-all"
                >
                  {loading ? "Saving..." : "Save Time"}
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {isEditOpen && (
        <HabitModal
          isOpen={isEditOpen}
          onClose={() => setIsEditOpen(false)}
          onSuccess={() => {
            setIsEditOpen(false);
            onRefresh();
          }}
          initialData={habit}
        />
      )}
    </>
  );
}
