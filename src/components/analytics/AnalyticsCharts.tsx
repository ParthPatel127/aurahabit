"use client";

import { useMemo } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  CartesianGrid,
} from "recharts";
import { Flame, Trophy, Award, Zap, Star } from "lucide-react";

interface Habit {
  id: string;
  name: string;
  color: string;
  category?: { name: string; color: string } | null;
  completions: Array<{ date: string; completed: boolean }>;
}

export function AnalyticsCharts({ habits }: { habits: Habit[] }) {
  // 1. Calculate overall current longest streak across all habits
  const overallBestStreak = useMemo(() => {
    let maxStreak = 0;
    habits.forEach((h) => {
      const dates = new Set(h.completions.filter((c) => c.completed).map((c) => c.date));
      const sorted = Array.from(dates).sort();
      let temp = 0;
      let prev: Date | null = null;
      for (const dStr of sorted) {
        const curr = new Date(dStr);
        if (prev) {
          const diff = Math.round((curr.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24));
          if (diff === 1) temp++;
          else temp = 1;
        } else {
          temp = 1;
        }
        if (temp > maxStreak) maxStreak = temp;
        prev = curr;
      }
    });
    return maxStreak;
  }, [habits]);

  // 2. Prepare Category distribution pie chart data
  const categoryPieData = useMemo(() => {
    const catMap: Record<string, { count: number; color: string }> = {};
    habits.forEach((h) => {
      const catName = h.category?.name || "Uncategorized";
      const catColor = h.category?.color || "#10B981";
      if (!catMap[catName]) {
        catMap[catName] = { count: 0, color: catColor };
      }
      catMap[catName].count += h.completions.filter((c) => c.completed).length;
    });

    return Object.entries(catMap).map(([name, val]) => ({
      name,
      value: val.count,
      color: val.color,
    }));
  }, [habits]);

  // 3. Prepare Last 7 days completion bar data
  const last7DaysData = useMemo(() => {
    const result = [];
    const today = new Date();

    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split("T")[0];
      const dayName = d.toLocaleDateString("en-US", { weekday: "short" });

      let completedCount = 0;
      habits.forEach((h) => {
        if (h.completions.some((c) => c.date === dateStr && c.completed)) {
          completedCount++;
        }
      });

      result.push({
        day: dayName,
        date: dateStr,
        completed: completedCount,
        total: habits.length,
        rate: habits.length > 0 ? Math.round((completedCount / habits.length) * 100) : 0,
      });
    }
    return result;
  }, [habits]);

  const badges = [
    { target: 7, label: "7 Days Streak", icon: Flame, color: "text-amber-500", bg: "bg-amber-500/10" },
    { target: 30, label: "30 Days Champion", icon: Trophy, color: "text-blue-500", bg: "bg-blue-500/10" },
    { target: 50, label: "50 Days Titan", icon: Award, color: "text-purple-500", bg: "bg-purple-500/10" },
    { target: 100, label: "100 Days Master", icon: Zap, color: "text-emerald-500", bg: "bg-emerald-500/10" },
    { target: 365, label: "365 Days Legend", icon: Star, color: "text-yellow-500", bg: "bg-yellow-500/10" },
  ];

  return (
    <div className="space-y-6">
      {/* Badges System */}
      <div className="glass-card p-6">
        <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-4 flex items-center gap-2">
          <Trophy className="w-5 h-5 text-amber-500" />
          Achievement Badges & Milestones
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {badges.map((b, idx) => {
            const Icon = b.icon;
            const unlocked = overallBestStreak >= b.target;

            return (
              <div
                key={idx}
                className={`p-4 rounded-xl border flex flex-col items-center justify-center text-center transition-all ${
                  unlocked
                    ? `${b.bg} border-amber-500/30 shadow-md`
                    : "bg-slate-50/50 dark:bg-slate-900/30 border-slate-200/60 dark:border-slate-800 opacity-50 grayscale"
                }`}
              >
                <div className={`p-3 rounded-full ${unlocked ? b.bg : "bg-slate-200 dark:bg-slate-800"} mb-2`}>
                  <Icon className={`w-6 h-6 ${unlocked ? b.color : "text-slate-400"}`} />
                </div>
                <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100">{b.label}</h4>
                <span className="text-[10px] font-semibold text-slate-500 mt-1">
                  {unlocked ? "UNLOCKED 🎉" : `${overallBestStreak} / ${b.target} Days`}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly Completion Rate */}
        <div className="glass-card p-6">
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-4">
            Daily Habits Completion (Last 7 Days)
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={last7DaysData}>
                <XAxis dataKey="day" stroke="#94a3b8" fontSize={12} />
                <YAxis stroke="#94a3b8" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#0f172a",
                    borderColor: "#334155",
                    borderRadius: "0.75rem",
                    color: "#fff",
                  }}
                />
                <Bar dataKey="completed" fill="#10B981" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Breakdown Pie Chart */}
        <div className="glass-card p-6">
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-4">
            Category Breakdown
          </h3>
          <div className="h-64">
            {categoryPieData.length === 0 ? (
              <div className="h-full flex items-center justify-center text-slate-400 text-xs">
                No completions data yet
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryPieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {categoryPieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color || "#10B981"} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#0f172a",
                      borderColor: "#334155",
                      borderRadius: "0.75rem",
                      color: "#fff",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
