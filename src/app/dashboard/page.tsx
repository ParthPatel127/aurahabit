"use client";

import { useEffect, useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { ReminderCard } from "@/components/dashboard/ReminderCard";
import { KPICards } from "@/components/dashboard/KPICards";
import { QuickCheckIn } from "@/components/dashboard/QuickCheckIn";
import { StreakHeatmap } from "@/components/dashboard/StreakHeatmap";
import { calculateRealProgressStats } from "@/lib/utils";
import { Target, Plus, CheckCircle2, Calendar } from "lucide-react";

export default function DashboardPage() {
  const [habits, setHabits] = useState<any[]>([]);
  const [goals, setGoals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    try {
      const [hRes, gRes] = await Promise.all([
        fetch("/api/habits"),
        fetch("/api/goals"),
      ]);
      const hData = await hRes.json();
      const gData = await gRes.json();

      if (Array.isArray(hData)) setHabits(hData);
      if (Array.isArray(gData)) setGoals(gData);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Compute 100% REAL accurate stats dynamically from database habit completions
  const kpiData = calculateRealProgressStats(habits);
  const allCompletions = habits.flatMap((h) => h.completions || []);

  const handleGoalCheckin = async (goal: any) => {
    try {
      await fetch(`/api/goals/${goal.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ incrementDay: true }),
      });
      fetchDashboardData();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <AppShell title="Executive Dashboard">
      {/* Smart Scheduled Reminders with Date, Time, and Day */}
      <ReminderCard />

      {/* KPI Stats Cards - 100% Real Exact Math */}
      <KPICards data={kpiData} />

      {/* Today Habit Checklist & Daily Goal Check-In Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <QuickCheckIn habits={habits} onRefresh={fetchDashboardData} />
        </div>

        {/* Daily Goal Check-In Widget */}
        <div className="lg:col-span-1 glass-card p-6 border border-emerald-500/20 bg-gradient-to-br from-emerald-500/5 to-teal-500/5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Target className="w-5 h-5 text-emerald-500" />
                Daily Goal Check-Ins
              </h2>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400">
                {goals.filter((g) => g.status === "COMPLETED").length} / {goals.length} Goals
              </span>
            </div>
            <p className="text-xs text-slate-500 mb-4">Log daily progress based on your target timeframe</p>

            {goals.length === 0 ? (
              <div className="py-8 text-center text-slate-400 text-xs">
                No active goals. Go to Goal Tracker to add milestones!
              </div>
            ) : (
              <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
                {goals.map((goal) => (
                  <div
                    key={goal.id}
                    className="p-3 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white/60 dark:bg-slate-900/60 flex items-center justify-between"
                  >
                    <div className="overflow-hidden pr-2">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[9px] font-bold uppercase text-emerald-600 dark:text-emerald-400">
                          {goal.timeframe}
                        </span>
                        <span className="text-[9px] text-slate-500">
                          ({goal.loggedDays || 0}/{goal.targetDays || 365}d)
                        </span>
                      </div>
                      <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate mt-0.5">
                        {goal.title}
                      </h4>
                      <div className="w-24 h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full mt-1 overflow-hidden">
                        <div
                          className="h-full bg-emerald-500 transition-all duration-300"
                          style={{ width: `${goal.progress}%` }}
                        />
                      </div>
                    </div>

                    <button
                      onClick={() => handleGoalCheckin(goal)}
                      disabled={goal.progress >= 100}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-bold shrink-0 transition-all flex items-center gap-1 ${
                        goal.progress >= 100
                          ? "bg-emerald-500/20 text-emerald-600 cursor-default"
                          : "bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm"
                      }`}
                    >
                      {goal.progress >= 100 ? "Done ✓" : "+1 Day"}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Activity Heatmap */}
      <StreakHeatmap completions={allCompletions} />
    </AppShell>
  );
}
