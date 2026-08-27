"use client";

import { useState, useMemo, useEffect } from "react";
import { Check, Calendar, Filter, Search, ChevronLeft, ChevronRight, Clock, Lock } from "lucide-react";

interface HabitItem {
  id: string;
  name: string;
  color: string;
  timeSlot?: string | null;
  startTime?: string | null;
  endTime?: string | null;
  reminderTime?: string | null;
  category?: { id: string; name: string; color: string } | null;
  completions: Array<{ date: string; completed: boolean }>;
}

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

export function YearlyMatrixGrid({ habits, categories, onRefresh }: { habits: HabitItem[]; categories: any[]; onRefresh: () => void }) {
  const now = new Date();

  // Date Locking Rule: Today is ALWAYS unlocked. Yesterday is unlocked until 8:00 AM. Future & older past dates are locked.
  const isEditableDate = (dateStr: string) => {
    const parts = dateStr.split("-").map(Number);
    if (parts.length !== 3) return false;
    const [cYear, cMonth, cDay] = parts;

    const now = new Date();
    const todayMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const targetMidnight = new Date(cYear, cMonth - 1, cDay);

    const diffMs = todayMidnight.getTime() - targetMidnight.getTime();
    const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return true; // Today is always unlocked
    if (diffDays === 1 && now.getHours() < 8) return true; // Yesterday is unlocked before 8:00 AM

    return false; // Locked for future dates (diffDays < 0) or past dates older than 8 AM yesterday (diffDays >= 1)
  };

  const [selectedYear, setSelectedYear] = useState<number>(now.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState<number>(now.getMonth());
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [togglingKey, setTogglingKey] = useState<string | null>(null);
  const [showTimeSlots, setShowTimeSlots] = useState<boolean>(false);
  const [hoveredHabitId, setHoveredHabitId] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/settings")
      .then((res) => res.json())
      .then((data) => {
        if (data && typeof data.showTimeSlots === "boolean") {
          setShowTimeSlots(data.showTimeSlots);
        }
      })
      .catch(() => {});
  }, []);

  const toggleShowTimeSlots = async () => {
    const nextVal = !showTimeSlots;
    setShowTimeSlots(nextVal);
    fetch("/api/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ showTimeSlots: nextVal }),
    }).catch(() => {});
  };

  const daysInMonth = useMemo(() => {
    return new Date(selectedYear, selectedMonth + 1, 0).getDate();
  }, [selectedYear, selectedMonth]);

  const filteredHabits = useMemo(() => {
    return habits.filter((h) => {
      const matchesSearch = h.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === "all" || h.category?.id === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [habits, searchQuery, selectedCategory]);

  const toggleCompletion = async (habitId: string, day: number) => {
    const monthStr = String(selectedMonth + 1).padStart(2, "0");
    const dayStr = String(day).padStart(2, "0");
    const dateStr = `${selectedYear}-${monthStr}-${dayStr}`;

    if (!isEditableDate(dateStr)) {
      alert("This date is locked! Check-ins are only allowed for Today, or Yesterday before 8:00 AM.");
      return;
    }

    const key = `${habitId}_${dateStr}`;
    setTogglingKey(key);

    const habit = habits.find((h) => h.id === habitId);
    const existing = habit?.completions.find((c) => c.date === dateStr);
    const currentCompleted = existing?.completed || false;

    try {
      await fetch("/api/habits/completions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          habitId,
          date: dateStr,
          completed: !currentCompleted,
        }),
      });
      onRefresh();
    } catch (e) {
      console.error("Toggle error:", e);
    } finally {
      setTogglingKey(null);
    }
  };

  return (
    <div className="space-y-4">
      {/* Controls Bar */}
      <div className="glass-card p-4 flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Month & Year Navigation */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              if (selectedMonth === 0) {
                setSelectedMonth(11);
                setSelectedYear((y) => y - 1);
              } else {
                setSelectedMonth((m) => m - 1);
              }
            }}
            className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-2">
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(Number(e.target.value))}
              className="bg-transparent font-bold text-base text-slate-900 dark:text-slate-100 cursor-pointer focus:outline-none"
            >
              {MONTHS.map((m, idx) => (
                <option key={idx} value={idx} className="bg-white dark:bg-slate-900">
                  {m}
                </option>
              ))}
            </select>

            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="bg-transparent font-bold text-base text-emerald-600 dark:text-emerald-400 cursor-pointer focus:outline-none"
            >
              {[2024, 2025, 2026, 2027].map((y) => (
                <option key={y} value={y} className="bg-white dark:bg-slate-900">
                  {y}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={() => {
              if (selectedMonth === 11) {
                setSelectedMonth(0);
                setSelectedYear((y) => y + 1);
              } else {
                setSelectedMonth((m) => m + 1);
              }
            }}
            className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Search, Filter & Optional Time Slots Toggle */}
        <div className="flex items-center gap-3 w-full md:w-auto flex-wrap justify-end">
          <button
            onClick={toggleShowTimeSlots}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
              showTimeSlots
                ? "bg-purple-500/20 text-purple-600 dark:text-purple-400 border border-purple-500/30"
                : "border border-slate-200 dark:border-slate-800 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
            }`}
            title="Toggle Daily Time Slots Column"
          >
            <Clock className="w-3.5 h-3.5" />
            {showTimeSlots ? "Time Slots: Visible" : "Time Slots: Hidden"}
          </button>

          <div className="relative flex-1 md:w-48">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search habits..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-white/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 text-xs rounded-xl px-2.5 py-1.5 focus:outline-none text-slate-700 dark:text-slate-300"
            >
              <option value="all">All Categories</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Yearly Matrix Excel Grid */}
      <div className="glass-card p-4 overflow-hidden relative">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[900px]">
            <thead>
              <tr className="border-b border-slate-200/80 dark:border-slate-800 text-xs text-slate-500 font-semibold">
                <th className="py-3 px-3 w-56 sticky left-0 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md z-10">
                  Habit Name
                </th>

                {showTimeSlots && (
                  <th className="py-3 px-2 w-32 text-slate-500 font-semibold">
                    Time Slot (From ➔ To)
                  </th>
                )}

                {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => {
                  const dateObj = new Date(selectedYear, selectedMonth, day);
                  const isToday =
                    dateObj.toDateString() === new Date().toDateString();

                  return (
                    <th
                      key={day}
                      className={`py-2 px-1 text-center w-8 ${
                        isToday ? "text-emerald-500 font-bold bg-emerald-500/10 rounded-t" : ""
                      }`}
                    >
                      <div>{day}</div>
                      <div className="text-[9px] font-normal uppercase text-slate-400">
                        {dateObj.toLocaleDateString("en-US", { weekday: "narrow" })}
                      </div>
                    </th>
                  );
                })}
                <th className="py-3 px-3 text-center w-20">Rate</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-xs">
              {filteredHabits.length === 0 ? (
                <tr>
                  <td colSpan={daysInMonth + (showTimeSlots ? 3 : 2)} className="py-8 text-center text-slate-400">
                    No matching habits found for this month.
                  </td>
                </tr>
              ) : (
                filteredHabits.map((habit) => {
                  const monthStr = String(selectedMonth + 1).padStart(2, "0");
                  let completedCount = 0;

                  const slotText = habit.startTime && habit.endTime
                    ? `From ${habit.startTime} To ${habit.endTime}`
                    : habit.timeSlot || "";

                  return (
                    <tr
                      key={habit.id}
                      className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors relative"
                    >
                      {/* Sticky Habit Header Cell */}
                      <td
                        onMouseEnter={() => setHoveredHabitId(habit.id)}
                        onMouseLeave={() => setHoveredHabitId(null)}
                        className="py-2.5 px-3 sticky left-0 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md font-semibold text-slate-800 dark:text-slate-200 z-10 relative cursor-pointer"
                      >
                        <div className="flex items-center gap-2">
                          <span
                            className="w-2.5 h-2.5 rounded-full shrink-0"
                            style={{ backgroundColor: habit.color || "#10B981" }}
                          />
                          <span className="truncate max-w-[180px]" title={habit.name}>
                            {habit.name}
                          </span>
                        </div>

                        {/* Floating Mouse Hover Popup Tooltip */}
                        {hoveredHabitId === habit.id && (
                          <div className="absolute left-full top-0 ml-2 w-64 p-3 rounded-xl bg-slate-900 text-white text-xs shadow-2xl z-50 border border-purple-500/30 pointer-events-none animate-in fade-in zoom-in-95">
                            <div className="flex items-center gap-1.5 mb-1 pb-1 border-b border-slate-800 font-bold text-emerald-400">
                              <Clock className="w-3.5 h-3.5 text-purple-400" />
                              <span>{habit.name} Schedule</span>
                            </div>
                            <div className="space-y-1 text-[11px] text-slate-300">
                              <p><span className="font-bold text-purple-400">Time Slot:</span> {slotText || "Not set"}</p>
                              <p><span className="font-bold text-amber-400">Alert Time:</span> {habit.reminderTime ? `⏰ ${habit.reminderTime}` : "No alert time"}</p>
                              <p><span className="font-bold text-teal-400">Category:</span> {habit.category?.name || "Uncategorized"}</p>
                            </div>
                          </div>
                        )}
                      </td>

                      {/* Optional Time Slot Cell */}
                      {showTimeSlots && (
                        <td
                          onMouseEnter={() => setHoveredHabitId(habit.id)}
                          onMouseLeave={() => setHoveredHabitId(null)}
                          className="py-2.5 px-2 text-[11px] font-semibold text-purple-600 dark:text-purple-400 relative"
                        >
                          {slotText ? (
                            <span className="px-2 py-0.5 rounded-md bg-purple-500/10 border border-purple-500/20 inline-block truncate max-w-[120px]" title={slotText}>
                              ⏱️ {slotText}
                            </span>
                          ) : (
                            <span className="text-slate-400 font-normal text-[10px]">—</span>
                          )}
                        </td>
                      )}

                      {/* Days 1 to daysInMonth */}
                      {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => {
                        const dayStr = String(day).padStart(2, "0");
                        const dateStr = `${selectedYear}-${monthStr}-${dayStr}`;
                        const isDone = habit.completions.some(
                          (c) => c.date === dateStr && c.completed
                        );

                        if (isDone) completedCount++;

                        const canEdit = isEditableDate(dateStr);

                        return (
                          <td key={day} className="py-2 px-1 text-center">
                            <button
                              onClick={() => {
                                if (!canEdit) return;
                                toggleCompletion(habit.id, day);
                              }}
                              disabled={!canEdit}
                              title={
                                canEdit
                                  ? isDone ? "Click to uncheck" : "Click to check in"
                                  : "🔒 Locked: Check-ins only allowed for Today, or Yesterday before 8:00 AM"
                              }
                              className={`w-6 h-6 rounded-md flex items-center justify-center mx-auto transition-all ${
                                isDone
                                  ? canEdit
                                    ? "bg-emerald-500 text-white shadow-sm shadow-emerald-500/30 cursor-pointer"
                                    : "bg-emerald-500/60 text-white/80 cursor-not-allowed"
                                  : canEdit
                                  ? "border border-slate-200 dark:border-slate-800 hover:border-emerald-500/50 hover:bg-emerald-50/50 dark:hover:bg-slate-800 cursor-pointer"
                                  : "border border-slate-200/40 dark:border-slate-800/40 bg-slate-100/30 dark:bg-slate-900/30 cursor-not-allowed opacity-40"
                              }`}
                            >
                              {isDone ? (
                                <Check className="w-3.5 h-3.5 stroke-[3]" />
                              ) : !canEdit ? (
                                <Lock className="w-2.5 h-2.5 text-slate-400 opacity-60" />
                              ) : null}
                            </button>
                          </td>
                        );
                      })}

                      {/* Completion Rate Percentage */}
                      <td className="py-2.5 px-3 text-center font-bold text-emerald-600 dark:text-emerald-400">
                        {Math.round((completedCount / daysInMonth) * 100)}%
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
