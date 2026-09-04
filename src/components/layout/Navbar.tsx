"use client";

import { useTheme } from "@/components/providers/ThemeProvider";
import { Sun, Moon, Bell, Plus, Calendar } from "lucide-react";
import { format } from "date-fns";
import { useState } from "react";
import { HabitModal } from "@/components/habits/HabitModal";
import { ReminderModal } from "@/components/dashboard/ReminderModal";

export function Navbar({ title }: { title: string }) {
  const { theme, toggleTheme } = useTheme();
  const [isHabitModalOpen, setIsHabitModalOpen] = useState(false);
  const [isReminderModalOpen, setIsReminderModalOpen] = useState(false);
  const todayFormatted = format(new Date(), "EEEE, MMMM d, yyyy");

  return (
    <>
      <header className="h-16 border-b border-slate-200/80 dark:border-slate-800 bg-white/60 dark:bg-slate-900/60 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-30">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">{title}</h1>
          <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5">
            <Calendar className="w-3.5 h-3.5 text-emerald-500" />
            {todayFormatted}
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Quick Add Reminder Button */}
          <button
            onClick={() => setIsReminderModalOpen(true)}
            className="hidden sm:flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20 text-amber-700 dark:text-amber-300 text-xs font-semibold transition-all active:scale-95 cursor-pointer shadow-sm"
            title="Create a new scheduled reminder with Date, Time, and Day"
          >
            <Bell className="w-3.5 h-3.5 text-amber-500" />
            <span>Add Reminder</span>
          </button>

          {/* Quick Create Habit Button */}
          <button
            onClick={() => setIsHabitModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs shadow-sm shadow-emerald-500/20 transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>New Habit</span>
          </button>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            title={`Switch to ${theme === "dark" ? "Light" : "Dark"} Mode`}
          >
            {theme === "dark" ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
          </button>
        </div>
      </header>

      {/* Reminder Modal */}
      {isReminderModalOpen && (
        <ReminderModal
          isOpen={isReminderModalOpen}
          onClose={() => setIsReminderModalOpen(false)}
          onSuccess={() => {
            setIsReminderModalOpen(false);
            window.location.reload();
          }}
        />
      )}

      {/* Habit Modal */}
      {isHabitModalOpen && (
        <HabitModal
          isOpen={isHabitModalOpen}
          onClose={() => setIsHabitModalOpen(false)}
          onSuccess={() => {
            setIsHabitModalOpen(false);
            window.location.reload();
          }}
        />
      )}
    </>
  );
}

