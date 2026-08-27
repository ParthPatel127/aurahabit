"use client";

import { AppShell } from "@/components/layout/AppShell";
import { FitnessTracker } from "@/components/trackers/FitnessTracker";

export default function FitnessPage() {
  return (
    <AppShell title="Fitness & Calorie Analytics">
      <FitnessTracker />
    </AppShell>
  );
}
