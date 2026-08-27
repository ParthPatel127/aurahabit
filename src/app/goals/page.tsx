"use client";

import { AppShell } from "@/components/layout/AppShell";
import { GoalBoard } from "@/components/goals/GoalBoard";

export default function GoalsPage() {
  return (
    <AppShell title="Milestone Goal Tracker">
      <GoalBoard />
    </AppShell>
  );
}
