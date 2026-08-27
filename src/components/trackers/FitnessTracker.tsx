"use client";

import { useState, useEffect } from "react";
import { Dumbbell, Flame, Clock, Plus, Activity } from "lucide-react";
import { formatDate } from "@/lib/utils";

export function FitnessTracker() {
  const [logs, setLogs] = useState<any[]>([]);
  const [workoutType, setWorkoutType] = useState("Weight Training");
  const [duration, setDuration] = useState("45");
  const [calories, setCalories] = useState("350");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);

  const fetchLogs = async () => {
    try {
      const res = await fetch("/api/trackers/workout");
      const data = await res.json();
      if (Array.isArray(data)) setLogs(data);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!workoutType) return;

    setLoading(true);
    try {
      await fetch("/api/trackers/workout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          workoutType,
          durationMinutes: Number(duration),
          caloriesBurned: Number(calories),
          notes,
        }),
      });

      setNotes("");
      fetchLogs();
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const totalCalories = logs.reduce((acc, curr) => acc + (curr.caloriesBurned || 0), 0);
  const totalMinutes = logs.reduce((acc, curr) => acc + (curr.durationMinutes || 0), 0);

  return (
    <div className="space-y-6">
      {/* Overview Header */}
      <div className="glass-card p-6 border border-rose-500/20 bg-gradient-to-br from-rose-500/5 to-amber-500/5 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Dumbbell className="w-5 h-5 text-rose-500" />
            Fitness & Workout Tracker
          </h2>
          <p className="text-xs text-slate-500">Track workout intensity, duration & calories burned</p>
        </div>

        <div className="flex items-center gap-4 text-center">
          <div className="px-4 py-2 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400">
            <div className="text-xl font-extrabold">{totalCalories}</div>
            <div className="text-[10px] font-semibold uppercase">Calories Burned 🔥</div>
          </div>
          <div className="px-4 py-2 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
            <div className="text-xl font-extrabold">{totalMinutes} m</div>
            <div className="text-[10px] font-semibold uppercase">Active Duration</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Workout Form */}
        <div className="glass-card p-6 lg:col-span-1">
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-4">Log New Workout</h3>
          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Workout Type *</label>
              <select
                value={workoutType}
                onChange={(e) => setWorkoutType(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-xs"
              >
                <option value="Weight Training">Weight Training / Gym</option>
                <option value="Running">Running / Cardio</option>
                <option value="Yoga & Stretching">Yoga & Stretching</option>
                <option value="Cycling">Cycling</option>
                <option value="Swimming">Swimming</option>
                <option value="HIIT Workout">HIIT Workout</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Duration (Min)</label>
                <input
                  type="number"
                  required
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Est. Calories</label>
                <input
                  type="number"
                  value={calories}
                  onChange={(e) => setCalories(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-xs"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Workout Notes</label>
              <input
                type="text"
                placeholder="e.g. Chest & Triceps day..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-xs"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md shadow-rose-500/20 mt-2"
            >
              {loading ? "Logging..." : "Log Workout"}
            </button>
          </form>
        </div>

        {/* Workout History */}
        <div className="glass-card p-6 lg:col-span-2">
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-4">Workout Log History</h3>
          <div className="space-y-3 max-h-[360px] overflow-y-auto pr-1">
            {logs.length === 0 ? (
              <div className="py-8 text-center text-slate-400 text-xs">No workouts logged yet.</div>
            ) : (
              logs.map((log) => (
                <div key={log.id} className="p-3.5 rounded-xl border border-slate-200/80 dark:border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-rose-500/10 text-rose-500">
                      <Activity className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100">{log.workoutType}</h4>
                      <p className="text-xs text-slate-500 mt-0.5">{log.notes || `${log.durationMinutes} minutes duration`}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-extrabold text-rose-600 dark:text-rose-400">🔥 {log.caloriesBurned} kcal</span>
                    <div className="text-[10px] text-slate-400 font-semibold">{log.date}</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
