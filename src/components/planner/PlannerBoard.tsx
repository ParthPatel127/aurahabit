"use client";

import { useState, useEffect, useRef } from "react";
import { ListTodo, CheckSquare, Plus, Trash2, Calendar, Star, FileText, GripVertical, Moon, Sun, ArrowRight } from "lucide-react";
import { formatDate } from "@/lib/utils";

interface TaskItem {
  id?: string;
  date: string;
  title: string;
  priority: number;
  completed: boolean;
  notes?: string;
}

export function PlannerBoard() {
  const now = new Date();

  const todayDate = new Date(now);
  const todayStr = formatDate(todayDate);

  const yesterdayDate = new Date(now);
  yesterdayDate.setDate(yesterdayDate.getDate() - 1);
  const yesterdayStr = formatDate(yesterdayDate);

  const tomorrowDate = new Date(now);
  tomorrowDate.setDate(tomorrowDate.getDate() + 1);
  const tomorrowStr = formatDate(tomorrowDate);

  const [selectedDate, setSelectedDate] = useState<string>(todayStr);

  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const draggedTaskPriority = useRef<number | null>(null);
  const dragOverPriority = useRef<number | null>(null);

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/planner?date=${selectedDate}`);
      const data = await res.json();
      if (Array.isArray(data)) {
        setTasks(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [selectedDate]);

  const saveTask = async (priority: number, title: string, existingId?: string) => {
    if (!title.trim()) return;

    try {
      if (existingId) {
        await fetch("/api/planner", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: existingId, title }),
        });
      } else {
        await fetch("/api/planner", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            date: selectedDate,
            priority,
            title,
            completed: false,
          }),
        });
      }
      fetchTasks();
    } catch (e) {
      console.error(e);
    }
  };

  const toggleTask = async (task: TaskItem) => {
    if (!task.id) return;
    try {
      await fetch("/api/planner", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: task.id, completed: !task.completed }),
      });
      fetchTasks();
    } catch (e) {
      console.error(e);
    }
  };

  const deleteTask = async (id: string) => {
    try {
      await fetch(`/api/planner?id=${id}`, { method: "DELETE" });
      fetchTasks();
    } catch (e) {
      console.error(e);
    }
  };

  // Drag and Drop reordering handlers
  const handleDragStart = (e: React.DragEvent, priorityLevel: number) => {
    draggedTaskPriority.current = priorityLevel;
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragEnter = (priorityLevel: number) => {
    dragOverPriority.current = priorityLevel;
  };

  const handleDrop = async (targetPriority: number) => {
    const sourcePriority = draggedTaskPriority.current;
    if (!sourcePriority || sourcePriority === targetPriority) return;

    const sourceTask = tasks.find((t) => t.priority === sourcePriority);
    const targetTask = tasks.find((t) => t.priority === targetPriority);

    if (!sourceTask) return;

    const updatedTasks = tasks.map((t) => {
      if (t.id === sourceTask.id) {
        return { ...t, priority: targetPriority };
      }
      if (targetTask && t.id === targetTask.id) {
        return { ...t, priority: sourcePriority };
      }
      return t;
    });

    setTasks(updatedTasks);
    draggedTaskPriority.current = null;
    dragOverPriority.current = null;

    // Persist updated priorities to backend API
    try {
      const payload = updatedTasks.map((t) => ({ id: t.id, priority: t.priority }));
      await fetch("/api/planner/reorder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tasks: payload }),
      });
    } catch (err) {
      console.error("Reorder error:", err);
    }
  };

  const priorities = [
    { level: 1, label: "Top Priority ⭐", color: "border-amber-500/50 bg-amber-500/5" },
    { level: 2, label: "Task 2", color: "border-blue-500/30 bg-blue-500/5" },
    { level: 3, label: "Task 3", color: "border-slate-200 dark:border-slate-800 bg-white/40 dark:bg-slate-900/40" },
    { level: 4, label: "Task 4", color: "border-slate-200 dark:border-slate-800 bg-white/40 dark:bg-slate-900/40" },
    { level: 5, label: "Task 5", color: "border-slate-200 dark:border-slate-800 bg-white/40 dark:bg-slate-900/40" },
  ];

  return (
    <div className="space-y-6">
      {/* Date Header */}
      <div className="glass-card p-4 flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Quick Date Selection Tabs */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setSelectedDate(yesterdayStr)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              selectedDate === yesterdayStr
                ? "bg-purple-600 text-white shadow-md shadow-purple-500/20"
                : "bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20 hover:bg-purple-500/20"
            }`}
          >
            <Moon className="w-3.5 h-3.5" />
            <span>Yesterday ({yesterdayStr})</span>
          </button>

          <button
            onClick={() => setSelectedDate(todayStr)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              selectedDate === todayStr
                ? "bg-emerald-600 text-white shadow-md shadow-emerald-500/20"
                : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
            }`}
          >
            Today ({todayStr})
          </button>

          <button
            onClick={() => setSelectedDate(tomorrowStr)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              selectedDate === tomorrowStr
                ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
                : "bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 hover:bg-blue-500/20"
            }`}
          >
            <Sun className="w-3.5 h-3.5" />
            <span>Tomorrow ({tomorrowStr})</span>
          </button>
        </div>

        {/* Date Input Selector */}
        <div className="flex items-center gap-2 text-slate-800 dark:text-slate-200 font-bold text-xs">
          <Calendar className="w-4 h-4 text-emerald-500" />
          <span>Specific Date:</span>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1 text-xs font-semibold focus:outline-none"
          />
        </div>
      </div>

      {/* 5 Priority Tasks Matrix with Drag and Drop */}
      <div className="glass-card p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-4">
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <ListTodo className="w-5 h-5 text-emerald-500" />
            <span>
              {selectedDate === yesterdayStr
                ? "Yesterday's 5 Priority Execution Matrix 🌙"
                : selectedDate === todayStr
                ? "Today's 5 Priority Execution Matrix ⚡"
                : selectedDate === tomorrowStr
                ? "Tomorrow's 5 Priority Execution Matrix ⭐"
                : `5 Priority Execution Matrix (${selectedDate})`}
            </span>
          </h2>
          <span className="text-xs font-semibold text-slate-400 flex items-center gap-1">
            💡 Drag & drop grip handles to swap task priorities!
          </span>
        </div>

        <div className="space-y-3">
          {priorities.map((p) => {
            const existingTask = tasks.find((t) => t.priority === p.level);

            return (
              <div
                key={p.level}
                draggable={!!existingTask}
                onDragStart={(e) => existingTask && handleDragStart(e, p.level)}
                onDragEnter={() => handleDragEnter(p.level)}
                onDragOver={(e) => e.preventDefault()}
                onDrop={() => handleDrop(p.level)}
                className={`p-4 rounded-xl border flex items-center gap-3 transition-all ${p.color} ${
                  existingTask ? "cursor-grab active:cursor-grabbing hover:shadow-md" : ""
                }`}
              >
                {existingTask ? (
                  <GripVertical className="w-4 h-4 text-slate-400 shrink-0 cursor-grab opacity-60 hover:opacity-100" />
                ) : (
                  <div className="w-4 h-4 shrink-0" />
                )}

                <span className="font-bold text-xs w-24 shrink-0 text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  {p.label}
                </span>

                {existingTask ? (
                  <div className="flex-1 flex items-center justify-between overflow-hidden">
                    <div className="flex items-center gap-3 overflow-hidden">
                      <input
                        type="checkbox"
                        checked={existingTask.completed}
                        onChange={() => toggleTask(existingTask)}
                        className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                      />
                      <span
                        className={`text-sm font-medium truncate ${
                          existingTask.completed ? "line-through text-slate-400" : "text-slate-800 dark:text-slate-200"
                        }`}
                      >
                        {existingTask.title}
                      </span>
                    </div>

                    <button
                      onClick={() => deleteTask(existingTask.id!)}
                      className="text-slate-400 hover:text-rose-500 p-1 shrink-0 ml-2"
                      title="Delete Task"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      const form = e.target as HTMLFormElement;
                      const input = form.elements.namedItem("taskTitle") as HTMLInputElement;
                      if (input.value) {
                        saveTask(p.level, input.value);
                        input.value = "";
                      }
                    }}
                    className="flex-1 flex items-center gap-2"
                  >
                    <input
                      name="taskTitle"
                      type="text"
                      placeholder={`Enter ${p.label}...`}
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white/60 dark:bg-slate-900/60 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                    <button
                      type="submit"
                      className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white font-bold text-xs shrink-0 shadow-sm"
                    >
                      Add
                    </button>
                  </form>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
