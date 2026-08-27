"use client";

import { useTheme } from "@/components/providers/ThemeProvider";
import { Sun, Moon, Sparkles, Plus, Calendar } from "lucide-react";
import { format } from "date-fns";
import { useState } from "react";
import { HabitModal } from "@/components/habits/HabitModal";
import { GitaModal } from "@/components/dashboard/GitaModal";

export function Navbar({ title }: { title: string }) {
  const { theme, toggleTheme } = useTheme();
  const [isHabitModalOpen, setIsHabitModalOpen] = useState(false);
  const [isGitaModalOpen, setIsGitaModalOpen] = useState(false);
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
          {/* Workable Gita Inspiration Button */}
          <button
            onClick={() => setIsGitaModalOpen(true)}
            className="hidden lg:flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-semibold transition-all active:scale-95 cursor-pointer shadow-sm"
            title="Click to view Bhagavad Gita Verse of the Day & Mindset Insights"
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
            <span>Bhagavad Gita Verse of the Day</span>
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

      {/* Gita Wisdom Modal */}
      {isGitaModalOpen && (
        <GitaModal
          isOpen={isGitaModalOpen}
          onClose={() => setIsGitaModalOpen(false)}
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
