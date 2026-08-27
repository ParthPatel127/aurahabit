"use client";

import { AppShell } from "@/components/layout/AppShell";
import { WaterTracker } from "@/components/trackers/WaterTracker";

export default function WaterPage() {
  return (
    <AppShell title="Hydration & Water Intake Tracker">
      <WaterTracker />
    </AppShell>
  );
}
