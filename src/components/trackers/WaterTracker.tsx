"use client";

import { useState, useEffect } from "react";
import { Droplets, Plus, RotateCcw, Target } from "lucide-react";
import { formatDate } from "@/lib/utils";

export function WaterTracker() {
  const [amountMl, setAmountMl] = useState<number>(0);
  const [goalMl, setGoalMl] = useState<number>(3000);
  const [loading, setLoading] = useState(true);

  const todayStr = formatDate();

  const fetchWater = async () => {
    try {
      const res = await fetch(`/api/trackers/water?date=${todayStr}`);
      const data = await res.json();
      if (data) {
        setAmountMl(data.amountMl || 0);
        setGoalMl(data.goalMl || 3000);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWater();
  }, []);

  const addWater = async (ml: number) => {
    const newAmount = Math.max(0, amountMl + ml);
    setAmountMl(newAmount);

    try {
      await fetch("/api/trackers/water", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date: todayStr,
          amountMl: newAmount,
          goalMl,
        }),
      });
    } catch (e) {
      console.error(e);
    }
  };

  const percentage = Math.min(100, Math.round((amountMl / Math.max(goalMl, 1)) * 100));
  const glasses = Math.round(amountMl / 250);

  return (
    <div className="glass-card p-6 border border-cyan-500/20 bg-gradient-to-br from-cyan-500/5 via-blue-500/5 to-teal-500/5">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Droplets className="w-5 h-5 text-cyan-500" />
            Hydro Log & Water Tracker
          </h2>
          <p className="text-xs text-slate-500">Default Goal: 3.0 Liters (3000 ml)</p>
        </div>

        <span className="text-xs font-bold px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-600 dark:text-cyan-400">
          {glasses} Glasses Consumed
        </span>
      </div>

      <div className="flex flex-col md:flex-row items-center justify-around gap-8">
        {/* Animated Circular Progress Indicator */}
        <div className="relative w-44 h-44 flex items-center justify-center">
          <svg className="w-full h-full transform -rotate-90">
            <circle
              cx="88"
              cy="88"
              r="70"
              className="stroke-slate-200 dark:stroke-slate-800"
              strokeWidth="12"
              fill="transparent"
            />
            <circle
              cx="88"
              cy="88"
              r="70"
              className="stroke-cyan-500 transition-all duration-500 ease-out"
              strokeWidth="12"
              strokeDasharray={440}
              strokeDashoffset={440 - (440 * percentage) / 100}
              strokeLinecap="round"
              fill="transparent"
            />
          </svg>
          <div className="absolute flex flex-col items-center justify-center text-center">
            <span className="text-3xl font-extrabold text-cyan-600 dark:text-cyan-400">
              {percentage}%
            </span>
            <span className="text-xs font-semibold text-slate-500 mt-0.5">
              {(amountMl / 1000).toFixed(1)}L / {(goalMl / 1000).toFixed(1)}L
            </span>
          </div>
        </div>

        {/* Quick Log Action Buttons */}
        <div className="space-y-3 w-full max-w-xs">
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => addWater(250)}
              className="p-3 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-600 dark:text-cyan-400 font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm active:scale-95 transition-transform"
            >
              <Plus className="w-4 h-4" /> +250 ml Glass
            </button>

            <button
              onClick={() => addWater(500)}
              className="p-3 rounded-xl bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 text-blue-600 dark:text-blue-400 font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm active:scale-95 transition-transform"
            >
              <Plus className="w-4 h-4" /> +500 ml Bottle
            </button>
          </div>

          <button
            onClick={() => addWater(-250)}
            className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-500 hover:text-slate-700 text-xs font-semibold flex items-center justify-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Undo Last Intake (-250ml)
          </button>
        </div>
      </div>
    </div>
  );
}
