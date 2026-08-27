"use client";

import { useState, useEffect } from "react";
import { Target, Plus, CheckCircle2, Clock, PlayCircle, Trash2, Edit3, Sparkles, Calendar } from "lucide-react";

interface Goal {
  id: string;
  title: string;
  description?: string;
  timeframe: string; // YEARLY, QUARTERLY, MONTHLY, WEEKLY
  targetDate?: string;
  status: string; // NOT_STARTED, IN_PROGRESS, COMPLETED
  progress: number;
  loggedDays: number;
  targetDays: number;
  lastCheckinDate?: string | null;
}

export function GoalBoard() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [activeTimeframe, setActiveTimeframe] = useState<string>("ALL");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);

  const todayStr = new Date().toISOString().split("T")[0];

  const fetchGoals = async () => {
    try {
      const res = await fetch("/api/goals");
      const data = await res.json();
      if (Array.isArray(data)) setGoals(data);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchGoals();
  }, []);

  const timeframes = ["ALL", "YEARLY", "QUARTERLY", "MONTHLY", "WEEKLY"];

  const filteredGoals = goals.filter(
    (g) => activeTimeframe === "ALL" || g.timeframe === activeTimeframe
  );

  const handleCheckinDay = async (goal: Goal) => {
    if (goal.lastCheckinDate === todayStr) {
      alert("You have already logged progress for this goal today! Come back tomorrow.");
      return;
    }

    try {
      const res = await fetch(`/api/goals/${goal.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ incrementDay: true }),
      });
      if (!res.ok) {
        const errData = await res.json();
        alert(errData.error || "Already logged today");
      }
      fetchGoals();
    } catch (e) {
      console.error(e);
    }
  };

  const handleCompleteGoal = async (goal: Goal) => {
    try {
      await fetch(`/api/goals/${goal.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ loggedDays: goal.targetDays, progress: 100, status: "COMPLETED" }),
      });
      fetchGoals();
    } catch (e) {
      console.error(e);
    }
  };

  const deleteGoal = async (id: string) => {
    if (!confirm("Are you sure you want to delete this goal?")) return;
    try {
      await fetch(`/api/goals/${id}`, { method: "DELETE" });
      fetchGoals();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-6">
      {/* Timeframe-Aware Daily Goal Check-In Banner */}
      <div className="glass-card p-6 border border-emerald-500/20 bg-gradient-to-br from-emerald-500/5 via-teal-500/5 to-cyan-500/5">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-emerald-500" />
              Daily Goal Progress Log (1 Check-In Max Per Day)
            </h2>
            <p className="text-xs text-slate-500">Log daily progress for goals based on your timeframe targets (Yearly: 365d, Quarterly: 90d, Monthly: 30d, Weekly: 7d)</p>
          </div>

          <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400">
            {goals.filter((g) => g.status === "COMPLETED").length} of {goals.length} Completed
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {goals
            .filter((g) => g.status !== "COMPLETED")
            .slice(0, 3)
            .map((g) => {
              const isLoggedToday = g.lastCheckinDate === todayStr;

              return (
                <div
                  key={g.id}
                  className="p-3.5 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 flex items-center justify-between gap-2"
                >
                  <div className="overflow-hidden">
                    <span className="text-[9px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                      {g.timeframe} • {g.loggedDays || 0}/{g.targetDays || 365} Days
                    </span>
                    <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">{g.title}</h4>
                    <div className="w-24 h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full mt-1 overflow-hidden">
                      <div className="h-full bg-emerald-500" style={{ width: `${g.progress}%` }} />
                    </div>
                  </div>

                  <button
                    onClick={() => handleCheckinDay(g)}
                    disabled={isLoggedToday}
                    className={`px-2.5 py-1.5 rounded-lg text-[10px] font-bold shrink-0 transition-all flex items-center gap-1 ${
                      isLoggedToday
                        ? "bg-slate-200 dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 cursor-default opacity-80"
                        : "bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm"
                    }`}
                  >
                    <Calendar className="w-3 h-3" />
                    {isLoggedToday ? "Logged Today ✓" : "+1 Day"}
                  </button>
                </div>
              );
            })}
        </div>
      </div>

      {/* Header & Timeframe Tabs */}
      <div className="glass-card p-4 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto">
          {timeframes.map((tf) => (
            <button
              key={tf}
              onClick={() => setActiveTimeframe(tf)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                activeTimeframe === tf
                  ? "bg-emerald-600 text-white shadow-md shadow-emerald-500/20"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
              }`}
            >
              {tf}
            </button>
          ))}
        </div>

        <button
          onClick={() => {
            setEditingGoal(null);
            setIsModalOpen(true);
          }}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-500/20"
        >
          <Plus className="w-4 h-4" />
          Add Goal
        </button>
      </div>

      {/* Goals Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredGoals.length === 0 ? (
          <div className="col-span-full text-center py-12 glass-card text-slate-400 text-sm">
            No goals found for {activeTimeframe}. Click "+ Add Goal" to set a milestone!
          </div>
        ) : (
          filteredGoals.map((goal) => {
            const isLoggedToday = goal.lastCheckinDate === todayStr;

            return (
              <div
                key={goal.id}
                className="glass-card p-5 flex flex-col justify-between border border-slate-200/80 dark:border-slate-800 glass-card-hover"
              >
                <div>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                        {goal.timeframe}
                      </span>
                      <span className="text-[10px] font-semibold text-slate-500">
                        {goal.loggedDays || 0} / {goal.targetDays || 365} Days
                      </span>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => {
                          setEditingGoal(goal);
                          setIsModalOpen(true);
                        }}
                        className="p-1 text-slate-400 hover:text-slate-600"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => deleteGoal(goal.id)}
                        className="p-1 text-slate-400 hover:text-rose-500"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <h3 className="font-bold text-base text-slate-900 dark:text-slate-100 mt-2">
                    {goal.title}
                  </h3>
                  {goal.description && (
                    <p className="text-xs text-slate-500 mt-1 line-clamp-2">{goal.description}</p>
                  )}
                </div>

                <div className="mt-4">
                  {/* Progress bar */}
                  <div className="flex items-center justify-between text-xs font-semibold mb-1">
                    <span className="text-slate-500">Target Progress</span>
                    <span className="text-emerald-600 dark:text-emerald-400">{goal.progress}%</span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden mb-3">
                    <div
                      className="h-full bg-emerald-500 rounded-full transition-all duration-300"
                      style={{ width: `${goal.progress}%` }}
                    />
                  </div>

                  {/* Daily Timeframe Check-In Buttons */}
                  <div className="flex items-center gap-2 mb-3">
                    <button
                      onClick={() => handleCheckinDay(goal)}
                      disabled={goal.progress >= 100 || isLoggedToday}
                      className={`flex-1 py-1.5 rounded-lg text-xs font-bold border transition-all flex items-center justify-center gap-1 ${
                        isLoggedToday
                          ? "bg-slate-100 dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 opacity-90 cursor-default"
                          : "bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border-emerald-500/30"
                      }`}
                    >
                      <Calendar className="w-3.5 h-3.5" />
                      {isLoggedToday ? "Logged Today ✓" : "+1 Day Logged"}
                    </button>
                    <button
                      onClick={() => handleCompleteGoal(goal)}
                      disabled={goal.progress >= 100}
                      className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-600 dark:text-slate-300 font-bold text-xs transition-all disabled:opacity-50"
                    >
                      Complete ✓
                    </button>
                  </div>

                  <div className="flex items-center justify-between text-xs font-semibold pt-2 border-t border-slate-100 dark:border-slate-800">
                    <span
                      className={`px-2 py-0.5 rounded-md ${
                        goal.status === "COMPLETED"
                          ? "bg-emerald-500/20 text-emerald-600"
                          : goal.status === "IN_PROGRESS"
                          ? "bg-blue-500/20 text-blue-600"
                          : "bg-slate-200 dark:bg-slate-800 text-slate-500"
                      }`}
                    >
                      {goal.status.replace("_", " ")}
                    </span>
                    {goal.targetDate && (
                      <span className="text-slate-400 text-[11px]">Due: {goal.targetDate}</span>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Add / Edit Goal Modal */}
      {isModalOpen && (
        <GoalModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSuccess={() => {
            setIsModalOpen(false);
            fetchGoals();
          }}
          initialData={editingGoal}
        />
      )}
    </div>
  );
}

function GoalModal({ isOpen, onClose, onSuccess, initialData }: any) {
  const [title, setTitle] = useState(initialData?.title || "");
  const [description, setDescription] = useState(initialData?.description || "");
  const [timeframe, setTimeframe] = useState(initialData?.timeframe || "YEARLY");
  const [targetDate, setTargetDate] = useState(initialData?.targetDate || "");
  const [targetDays, setTargetDays] = useState(
    initialData?.targetDays || (timeframe === "WEEKLY" ? 7 : timeframe === "MONTHLY" ? 30 : timeframe === "QUARTERLY" ? 90 : 365)
  );

  useEffect(() => {
    if (!initialData) {
      if (timeframe === "WEEKLY") setTargetDays(7);
      else if (timeframe === "MONTHLY") setTargetDays(30);
      else if (timeframe === "QUARTERLY") setTargetDays(90);
      else setTargetDays(365);
    }
  }, [timeframe, initialData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const url = initialData ? `/api/goals/${initialData.id}` : "/api/goals";
    const method = initialData ? "PUT" : "POST";

    const bodyData: any = {
      title,
      description,
      timeframe,
      targetDate,
      targetDays: Number(targetDays),
    };

    if (!initialData) {
      bodyData.loggedDays = 0;
    }

    await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(bodyData),
    });

    onSuccess();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-md p-6">
        <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-4">
          {initialData ? "Edit Goal" : "Add Goal"}
        </h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Goal Title *</label>
            <input
              type="text"
              required
              placeholder="e.g. Read 24 Books, Master Next.js, Marathon..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-sm"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Timeframe</label>
              <select
                value={timeframe}
                onChange={(e) => setTimeframe(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-sm"
              >
                <option value="YEARLY">Yearly (365d)</option>
                <option value="QUARTERLY">Quarterly (90d)</option>
                <option value="MONTHLY">Monthly (30d)</option>
                <option value="WEEKLY">Weekly (7d)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Target Days</label>
              <input
                type="number"
                value={targetDays}
                onChange={(e) => setTargetDays(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Already Logged Days
              </label>
              <div className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-800/80 text-sm font-bold text-emerald-600 dark:text-emerald-400 flex items-center justify-between cursor-not-allowed">
                <span>{initialData?.loggedDays || 0} Days</span>
                <span className="text-[10px] font-normal text-slate-400">Via +1 Day</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Target Date</label>
              <input
                type="date"
                value={targetDate}
                onChange={(e) => setTargetDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-sm"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3">
            <button type="button" onClick={onClose} className="px-4 py-2 text-xs font-semibold text-slate-500">Cancel</button>
            <button type="submit" className="px-4 py-2 bg-emerald-600 text-white font-bold text-xs rounded-xl">Save Goal</button>
          </div>
        </form>
      </div>
    </div>
  );
}
