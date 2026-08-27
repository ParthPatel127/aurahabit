"use client";

import { AppShell } from "@/components/layout/AppShell";
import { StudyTracker } from "@/components/trackers/StudyTracker";

export default function StudyPage() {
  return (
    <AppShell title="Study & Pomodoro Log">
      <StudyTracker />
    </AppShell>
  );
}
