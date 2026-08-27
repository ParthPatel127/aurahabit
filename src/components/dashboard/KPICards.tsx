"use client";

import { CheckCircle2, Flame, Trophy, Calendar, Target, AlertCircle, Percent } from "lucide-react";

interface KPIData {
  totalHabits: number;
  completedToday: number;
  todayRate: number;
  weeklyRate: number;
  monthlyRate: number;
  yearlyRate: number;
  currentStreak: number;
  bestStreak: number;
  missedToday: number;
}

export function KPICards({ data }: { data: KPIData }) {
  const cards = [
    {
      title: "Completed Today",
      value: `${data.completedToday} / ${data.totalHabits}`,
      subtext: `${data.todayRate}% today`,
      icon: CheckCircle2,
      color: "text-emerald-500",
      bg: "bg-emerald-500/10",
      border: "border-emerald-500/20",
    },
    {
      title: "Current Streak",
      value: `${data.currentStreak} Days`,
      subtext: `Best: ${data.bestStreak} Days 🔥`,
      icon: Flame,
      color: "text-amber-500",
      bg: "bg-amber-500/10",
      border: "border-amber-500/20",
    },
    {
      title: "Weekly Consistency",
      value: `${data.weeklyRate}%`,
      subtext: "Last 7 days average",
      icon: Percent,
      color: "text-blue-500",
      bg: "bg-blue-500/10",
      border: "border-blue-500/20",
    },
    {
      title: "Monthly Progress",
      value: `${data.monthlyRate}%`,
      subtext: "Current month completion",
      icon: Calendar,
      color: "text-purple-500",
      bg: "bg-purple-500/10",
      border: "border-purple-500/20",
    },
    {
      title: "Yearly Completion",
      value: `${data.yearlyRate}%`,
      subtext: "Total year rate",
      icon: Trophy,
      color: "text-indigo-500",
      bg: "bg-indigo-500/10",
      border: "border-indigo-500/20",
    },
    {
      title: "Missed Habits",
      value: `${data.missedToday}`,
      subtext: "Action needed for today",
      icon: AlertCircle,
      color: "text-rose-500",
      bg: "bg-rose-500/10",
      border: "border-rose-500/20",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
      {cards.map((card, idx) => {
        const Icon = card.icon;
        return (
          <div
            key={idx}
            className={`glass-card p-4 flex flex-col justify-between border ${card.border} glass-card-hover`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                {card.title}
              </span>
              <div className={`p-2 rounded-lg ${card.bg}`}>
                <Icon className={`w-4 h-4 ${card.color}`} />
              </div>
            </div>

            <div className="mt-3">
              <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                {card.value}
              </h3>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-1">
                {card.subtext}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
