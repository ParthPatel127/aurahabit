"use client";

import { useState, useEffect } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { SettingsView } from "@/components/settings/SettingsView";

export default function SettingsPage() {
  const [habits, setHabits] = useState<any[]>([]);
  const [goals, setGoals] = useState<any[]>([]);
  const [plannerTasks, setPlannerTasks] = useState<any[]>([]);

  useEffect(() => {
    Promise.all([
      fetch("/api/habits").then((r) => r.json()),
      fetch("/api/goals").then((r) => r.json()),
      fetch("/api/planner").then((r) => r.json()),
    ])
      .then(([hData, gData, pData]) => {
        if (Array.isArray(hData)) setHabits(hData);
        if (Array.isArray(gData)) setGoals(gData);
        if (Array.isArray(pData)) setPlannerTasks(pData);
      })
      .catch((e) => console.error(e));
  }, []);

  return (
    <AppShell title="Settings & Data Export">
      <SettingsView habits={habits} goals={goals} plannerTasks={plannerTasks} />
    </AppShell>
  );
}
