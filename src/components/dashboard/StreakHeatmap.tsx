"use client";

import { useMemo } from "react";
import { formatDate } from "@/lib/utils";

interface Completion {
  date: string;
  completed: boolean;
}

export function StreakHeatmap({ completions }: { completions: Completion[] }) {
  const days = useMemo(() => {
    const list: Array<{ date: string; count: number; dayOfWeek: number }> = [];
    const today = new Date();
    const countMap: Record<string, number> = {};

    completions.forEach((c) => {
      if (c.completed) {
        countMap[c.date] = (countMap[c.date] || 0) + 1;
      }
    });

    // Generate last 119 days (17 weeks x 7 days)
    for (let i = 118; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dateStr = formatDate(d);
      list.push({
        date: dateStr,
        count: countMap[dateStr] || 0,
        dayOfWeek: d.getDay(),
      });
    }
    return list;
  }, [completions]);

  const getColorClass = (count: number) => {
    if (count === 0) return "bg-slate-100 dark:bg-slate-800/80";
    if (count === 1) return "bg-emerald-400/50";
    if (count === 2) return "bg-emerald-500";
    if (count >= 3) return "bg-emerald-600 shadow-sm shadow-emerald-500/50";
    return "bg-slate-100 dark:bg-slate-800";
  };

  return (
    <div className="glass-card p-6">
      <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-3 flex items-center justify-between">
        <span>Activity & Consistency Heatmap</span>
        <span className="text-xs font-normal text-slate-500">Last 17 Weeks</span>
      </h3>

      <div className="overflow-x-auto pb-2">
        <div className="grid grid-rows-7 grid-flow-col gap-1.5 min-w-[650px]">
          {days.map((item, idx) => (
            <div
              key={idx}
              title={`${item.date}: ${item.count} habit(s) completed`}
              className={`w-3.5 h-3.5 rounded-sm transition-all hover:scale-125 hover:z-10 cursor-pointer ${getColorClass(item.count)}`}
            />
          ))}
        </div>
      </div>

      <div className="flex items-center justify-end gap-2 text-[10px] text-slate-400 mt-2">
        <span>Less</span>
        <div className="w-2.5 h-2.5 rounded-sm bg-slate-100 dark:bg-slate-800" />
        <div className="w-2.5 h-2.5 rounded-sm bg-emerald-400/50" />
        <div className="w-2.5 h-2.5 rounded-sm bg-emerald-500" />
        <div className="w-2.5 h-2.5 rounded-sm bg-emerald-600" />
        <span>More</span>
      </div>
    </div>
  );
}
