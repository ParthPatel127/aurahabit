"use client";

import { useState, useEffect } from "react";
import { Sun, Moon, Monitor, Clock } from "lucide-react";
import { useTheme } from "@/components/providers/ThemeProvider";

export function SettingsView({ habits, goals, plannerTasks }: { habits?: any[]; goals?: any[]; plannerTasks?: any[] } = {}) {
  const { theme, setTheme } = useTheme();
  const [showTimeSlots, setShowTimeSlots] = useState(false);

  useEffect(() => {
    fetch("/api/settings")
      .then((r) => r.json())
      .then((d) => {
        if (d && typeof d.showTimeSlots === "boolean") {
          setShowTimeSlots(d.showTimeSlots);
        }
      })
      .catch(() => {});
  }, []);

  const handleToggleTimeSlots = async (val: boolean) => {
    setShowTimeSlots(val);
    try {
      await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ showTimeSlots: val }),
      });
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Yearly Matrix Time Slots Setting */}
      <div className="glass-card p-6">
        <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2 mb-2">
          <Clock className="w-5 h-5 text-purple-500" />
          Yearly Matrix Grid Time Slots Display
        </h2>
        <p className="text-xs text-slate-500 mb-4">Enable to display an optional Time Slot column (target daily duration/time e.g., "From 08:00 To 09:00") next to habits in the Yearly Matrix Grid.</p>

        <div className="flex items-center justify-between p-4 rounded-xl border border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <Clock className="w-5 h-5 text-purple-500" />
            <div>
              <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100">Display Habit Time Slots Column</h4>
              <p className="text-xs text-slate-500">Show scheduled time duration for each habit in grid views</p>
            </div>
          </div>

          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={showTimeSlots}
              onChange={(e) => handleToggleTimeSlots(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
          </label>
        </div>
      </div>

      {/* Theme Preference Settings */}
      <div className="glass-card p-6">
        <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2 mb-2">
          <Sun className="w-5 h-5 text-amber-500" />
          Theme & Aesthetic Preference
        </h2>
        <p className="text-xs text-slate-500 mb-4">Select your preferred color scheme. Your theme preference is stored in your database account settings (`UserSettings`).</p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { id: "light", label: "Light Theme", icon: Sun },
            { id: "dark", label: "Dark Theme", icon: Moon },
            { id: "system", label: "System Default", icon: Monitor },
          ].map((item) => {
            const Icon = item.icon;
            const isSelected = theme === item.id;

            return (
              <button
                key={item.id}
                onClick={() => setTheme(item.id as any)}
                className={`p-4 rounded-xl border flex flex-col items-center justify-center gap-2 text-xs font-bold transition-all ${
                  isSelected
                    ? "border-emerald-500 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 shadow-sm"
                    : "border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                }`}
              >
                <Icon className="w-5 h-5" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
