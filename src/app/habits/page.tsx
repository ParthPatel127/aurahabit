"use client";

import { useState, useEffect, useRef } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { HabitCard } from "@/components/habits/HabitCard";
import { HabitModal } from "@/components/habits/HabitModal";
import { Plus, Search, Filter, Archive, GripVertical, Moon, Clock } from "lucide-react";
import { formatDate } from "@/lib/utils";

export default function HabitsPage() {
  const [habits, setHabits] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [showArchived, setShowArchived] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const now = new Date();
  const currentHour = now.getHours();
  const todayStr = formatDate();

  // Yesterday date calculation for 8-Hour Grace Period (Local Timezone Aware)
  const yesterdayDate = new Date(now);
  yesterdayDate.setDate(yesterdayDate.getDate() - 1);
  const yesterdayStr = formatDate(yesterdayDate);

  const isGracePeriodActive = currentHour < 8;
  const [activeDateTab, setActiveDateTab] = useState<string>(todayStr);

  useEffect(() => {
    if (!isGracePeriodActive) {
      setActiveDateTab(todayStr);
    }
  }, [isGracePeriodActive, todayStr]);

  const dragItem = useRef<number | null>(null);
  const dragOverItem = useRef<number | null>(null);

  const fetchData = async () => {
    try {
      const res = await fetch(`/api/habits?archived=${showArchived}`);
      const data = await res.json();
      if (Array.isArray(data)) setHabits(data);

      const catRes = await fetch("/api/categories");
      const catData = await catRes.json();
      if (Array.isArray(catData)) setCategories(catData);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchData();
  }, [showArchived]);

  const filteredHabits = habits.filter((h) => {
    const matchesSearch = h.name.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = selectedCategory === "all" || h.categoryId === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Drag and drop handlers
  const handleDragStart = (e: React.DragEvent, index: number) => {
    dragItem.current = index;
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragEnter = (index: number) => {
    dragOverItem.current = index;
  };

  const handleDrop = async () => {
    if (dragItem.current === null || dragOverItem.current === null) return;
    if (dragItem.current === dragOverItem.current) return;

    const copyList = [...filteredHabits];
    const draggedItemContent = copyList[dragItem.current];
    copyList.splice(dragItem.current, 1);
    copyList.splice(dragOverItem.current, 0, draggedItemContent);

    dragItem.current = null;
    dragOverItem.current = null;

    setHabits(copyList);

    try {
      const habitIds = copyList.map((h) => h.id);
      await fetch("/api/habits/reorder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ habitIds }),
      });
    } catch (err) {
      console.error("Reorder error:", err);
    }
  };

  return (
    <AppShell title="Habits">
      {/* 8-Hour Grace Period Date Selector Header Bar */}
      <div className="glass-card p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <span>Habit Tracker Checklist</span>
            {isGracePeriodActive && (
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-600 dark:text-purple-400 font-bold flex items-center gap-1">
                <Moon className="w-3 h-3" /> 8h Grace Period Active
              </span>
            )}
          </h2>
          <p className="text-xs text-slate-500">Manage, reorder, and check off habits for {activeDateTab}</p>
        </div>

        {/* Date Tabs */}
        <div className="flex items-center gap-2">
          {isGracePeriodActive && (
            <button
              onClick={() => setActiveDateTab(yesterdayStr)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeDateTab === yesterdayStr
                  ? "bg-purple-600 text-white shadow-md"
                  : "bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20 hover:bg-purple-500/20"
              }`}
              title="8-Hour Grace Period Active (Ends at 8:00 AM). Check off yesterday's habits!"
            >
              <Moon className="w-3.5 h-3.5" />
              <span>Yesterday ({yesterdayStr})</span>
            </button>
          )}

          <button
            onClick={() => setActiveDateTab(todayStr)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeDateTab === todayStr
                ? "bg-emerald-600 text-white shadow-md"
                : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
            }`}
          >
            Today ({todayStr})
          </button>
        </div>
      </div>

      {isGracePeriodActive && activeDateTab === yesterdayStr && (
        <div className="p-3 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-purple-700 dark:text-purple-300 text-xs font-semibold flex items-center gap-2">
          <Clock className="w-4 h-4 text-purple-500 shrink-0" />
          <span>🌙 8-Hour Grace Period is active until 8:00 AM! Checking off habits here saves your streak for yesterday ({yesterdayStr}).</span>
        </div>
      )}

      {/* Controls Bar */}
      <div className="glass-card p-4 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="Search habits..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 text-xs focus:outline-none"
            />
          </div>

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 text-xs focus:outline-none"
          >
            <option value="all">All Categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto justify-end">
          <span className="hidden sm:inline-block text-[11px] font-semibold text-slate-400">
            💡 Drag cards to custom reorder
          </span>

          <button
            onClick={() => setShowArchived(!showArchived)}
            className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
              showArchived
                ? "bg-amber-500/20 text-amber-600"
                : "border border-slate-200 dark:border-slate-800 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
            }`}
          >
            <Archive className="w-3.5 h-3.5" />
            {showArchived ? "Viewing Archived" : "View Archived"}
          </button>

          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-500/20"
          >
            <Plus className="w-4 h-4" />
            Create Habit
          </button>
        </div>
      </div>

      {/* Habits Grid with Native Drag-and-Drop Reordering */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredHabits.length === 0 ? (
          <div className="col-span-full text-center py-16 glass-card text-slate-400 text-sm">
            No habits found. Click "+ Create Habit" to get started!
          </div>
        ) : (
          filteredHabits.map((habit, index) => (
            <div
              key={habit.id}
              draggable
              onDragStart={(e) => handleDragStart(e, index)}
              onDragEnter={() => handleDragEnter(index)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              className="transition-transform active:scale-[0.98]"
            >
              <HabitCard
                habit={habit}
                onRefresh={fetchData}
                activeDateTab={activeDateTab}
              />
            </div>
          ))
        )}
      </div>

      {isModalOpen && (
        <HabitModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSuccess={() => {
            setIsModalOpen(false);
            fetchData();
          }}
        />
      )}
    </AppShell>
  );
}
