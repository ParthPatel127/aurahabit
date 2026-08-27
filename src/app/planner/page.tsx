"use client";

import { AppShell } from "@/components/layout/AppShell";
import { PlannerBoard } from "@/components/planner/PlannerBoard";

export default function PlannerPage() {
  return (
    <AppShell title="Tomorrow Execution Planner">
      <PlannerBoard />
    </AppShell>
  );
}
