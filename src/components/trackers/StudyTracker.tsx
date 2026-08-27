"use client";

import { useState, useEffect } from "react";
import { BookOpen, Clock, Plus, Flame, CheckCircle } from "lucide-react";
import { formatDate } from "@/lib/utils";

export function StudyTracker() {
  const [logs, setLogs] = useState<any[]>([]);
  const [subject, setSubject] = useState("");
  const [duration, setDuration] = useState("");
  const [topics, setTopics] = useState("");
  const [pomodoros, setPomodoros] = useState("1");
  const [loading, setLoading] = useState(false);

  const fetchLogs = async () => {
    try {
      const res = await fetch("/api/trackers/study");
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
    if (!subject || !duration) return;

    setLoading(true);
    try {
      await fetch("/api/trackers/study", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject,
          durationMinutes: Number(duration),
          topicsCompleted: topics,
          pomodoroCount: Number(pomodoros),
        }),
      });

      setSubject("");
      setDuration("");
      setTopics("");
      fetchLogs();
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const totalMinutes = logs.reduce((acc, curr) => acc + (curr.durationMinutes || 0), 0);
  const totalHours = (totalMinutes / 60).toFixed(1);

  return (
    <div className="space-y-6">
      {/* Overview Card */}
      <div className="glass-card p-6 border border-blue-500/20 bg-gradient-to-br from-blue-500/5 to-indigo-500/5 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-blue-500" />
            Study & Academic Tracker
          </h2>
          <p className="text-xs text-slate-500">Track study duration, topics & pomodoro sessions</p>
        </div>

        <div className="flex items-center gap-4 text-center">
          <div className="px-4 py-2 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
            <div className="text-xl font-extrabold">{totalHours} hrs</div>
            <div className="text-[10px] font-semibold uppercase">Total Studied</div>
          </div>
          <div className="px-4 py-2 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
            <div className="text-xl font-extrabold">{logs.length}</div>
            <div className="text-[10px] font-semibold uppercase">Sessions</div>
          </div>
        </div>
      </div>

      {/* Log Session Form & History */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="glass-card p-6 lg:col-span-1">
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-4">Log Study Session</h3>
          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Subject / Topic *</label>
              <input
                type="text"
                required
                placeholder="e.g. Next.js 15 App Router..."
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-xs"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Duration (Min)</label>
                <input
                  type="number"
                  required
                  placeholder="60"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Pomodoros</label>
                <input
                  type="number"
                  value={pomodoros}
                  onChange={(e) => setPomodoros(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-xs"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Topics Completed</label>
              <input
                type="text"
                placeholder="Optional notes..."
                value={topics}
                onChange={(e) => setTopics(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-xs"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 mt-2"
            >
              {loading ? "Logging..." : "Log Session"}
            </button>
          </form>
        </div>

        {/* Study Logs List */}
        <div className="glass-card p-6 lg:col-span-2">
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-4">Recent Sessions</h3>
          <div className="space-y-3 max-h-[360px] overflow-y-auto pr-1">
            {logs.length === 0 ? (
              <div className="py-8 text-center text-slate-400 text-xs">No study sessions logged yet.</div>
            ) : (
              logs.map((log) => (
                <div key={log.id} className="p-3.5 rounded-xl border border-slate-200/80 dark:border-slate-800 flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100">{log.subject}</h4>
                    <p className="text-xs text-slate-500 mt-0.5">{log.topicsCompleted || "No additional notes"}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-extrabold text-blue-600 dark:text-blue-400">{log.durationMinutes} min</span>
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
