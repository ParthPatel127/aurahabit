"use client";

import { useState, useEffect } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { AnalyticsCharts } from "@/components/analytics/AnalyticsCharts";

export default function AnalyticsPage() {
  const [habits, setHabits] = useState<any[]>([]);

  useEffect(() => {
    fetch("/api/habits")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setHabits(data);
      })
      .catch((e) => console.error(e));
  }, []);

  return (
    <AppShell title="Analytics & Streak Milestones">
      <AnalyticsCharts habits={habits} />
    </AppShell>
  );
}
