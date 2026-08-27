"use client";

import { useState, useEffect, useRef } from "react";
import { ListTodo, CheckSquare, Plus, Trash2, Calendar, Star, FileText, GripVertical } from "lucide-react";
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
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return formatDate(tomorrow);
  });

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
      <div className="glass-card p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-slate-800 dark:text-slate-200 font-bold text-base">
          <Calendar className="w-5 h-5 text-emerald-500" />
          <span>Plan for:</span>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1 text-sm font-semibold focus:outline-none"
          />
        </div>

        <button
          onClick={() => {
            const tmw = new Date();
            tmw.setDate(tmw.getDate() + 1);
            setSelectedDate(formatDate(tmw));
          }}
          className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20"
        >
          Set to Tomorrow
        </button>
      </div>

      {/* 5 Priority Tasks Matrix with Drag and Drop */}
      <div className="glass-card p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-4">
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <ListTodo className="w-5 h-5 text-emerald-500" />
            Tomorrow's 5 Priority Execution Matrix
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
