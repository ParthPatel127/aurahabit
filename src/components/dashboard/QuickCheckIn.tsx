"use client";

import { useState, useEffect } from "react";
import { Check, Flame, Target, Moon, Clock } from "lucide-react";
import { formatDate } from "@/lib/utils";

interface HabitItem {
  id: string;
  name: string;
  color: string;
  icon: string;
  category?: { name: string; color: string } | null;
  completions: Array<{ date: string; completed: boolean }>;
}

export function QuickCheckIn({ habits, onRefresh }: { habits: HabitItem[]; onRefresh: () => void }) {
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const now = new Date();
  const currentHour = now.getHours();
  const todayStr = formatDate();

  // Calculate yesterday date for 8-hour Grace Period (Local Timezone Aware)
  const yesterdayDate = new Date(now);
  yesterdayDate.setDate(yesterdayDate.getDate() - 1);
  const yesterdayStr = formatDate(yesterdayDate);

  // Grace Period active between 00:00 AM and 08:00 AM
  const isGracePeriodActive = currentHour < 8;
  const [activeDateTab, setActiveDateTab] = useState<string>(todayStr);

  useEffect(() => {
    if (!isGracePeriodActive) {
      setActiveDateTab(todayStr);
    }
  }, [isGracePeriodActive, todayStr]);

  const toggleCompletion = async (habitId: string, currentStatus: boolean) => {
    setLoadingId(habitId);
    try {
      await fetch("/api/habits/completions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          habitId,
          date: activeDateTab,
          completed: !currentStatus,
        }),
      });
      onRefresh();
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div className="glass-card p-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Target className="w-5 h-5 text-emerald-500" />
            Habit Checklist
          </h2>
          <p className="text-xs text-slate-500">Quick check-in to keep your streaks alive</p>
        </div>

        {/* Date Tabs & 8-Hour Grace Period Alert */}
        <div className="flex items-center gap-2">
          {isGracePeriodActive && (
            <button
              onClick={() => setActiveDateTab(yesterdayStr)}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition-all flex items-center gap-1 ${
                activeDateTab === yesterdayStr
                  ? "bg-purple-600 text-white shadow-md"
                  : "bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20"
              }`}
              title="8-Hour Grace Period Active (Ends at 8:00 AM). You can check off yesterday's habits!"
            >
              <Moon className="w-3.5 h-3.5" />
              <span>Yesterday ({yesterdayStr})</span>
            </button>
          )}

          <button
            onClick={() => setActiveDateTab(todayStr)}
            className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
              activeDateTab === todayStr
                ? "bg-emerald-600 text-white shadow-md"
                : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
            }`}
          >
            Today ({todayStr})
          </button>
        </div>
      </div>

      {isGracePeriodActive && activeDateTab === yesterdayStr && (
        <div className="mb-3 p-2.5 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-700 dark:text-purple-300 text-xs font-semibold flex items-center gap-2">
          <Clock className="w-4 h-4 text-purple-500 shrink-0" />
          <span>🌙 8-Hour Grace Period Active! Checking off habits here marks them complete for yesterday.</span>
        </div>
      )}

      {habits.length === 0 ? (
        <div className="text-center py-8 text-slate-400 text-sm">
          No active habits found. Click "+ New Habit" to create your first habit!
        </div>
      ) : (
        <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
          {habits.map((habit) => {
            const isCompleted = habit.completions.some((c) => c.date === activeDateTab && c.completed);
            const streak = habit.completions.filter((c) => c.completed).length;

            return (
              <div
                key={habit.id}
                onClick={() => toggleCompletion(habit.id, isCompleted)}
                className={`p-3.5 rounded-xl border flex items-center justify-between cursor-pointer transition-all duration-150 ${
                  isCompleted
                    ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-950 dark:text-emerald-100"
                    : "bg-white/50 dark:bg-slate-900/50 border-slate-200/70 dark:border-slate-800 hover:border-emerald-500/30"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-6 h-6 rounded-lg border flex items-center justify-center transition-all ${
                      isCompleted
                        ? "bg-emerald-500 border-emerald-500 text-white"
                        : "border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                    }`}
                  >
                    {isCompleted && <Check className="w-4 h-4 stroke-[3]" />}
                  </div>

                  <div>
                    <h4 className={`text-sm font-semibold ${isCompleted ? "line-through opacity-80" : ""}`}>
                      {habit.name}
                    </h4>
                    {habit.category && (
                      <span
                        className="text-[10px] font-semibold px-2 py-0.5 rounded-full inline-block mt-0.5"
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

                <div className="flex items-center gap-2 text-xs font-semibold text-amber-500">
                  <Flame className="w-4 h-4 fill-amber-500/20" />
                  <span>{streak} d</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
