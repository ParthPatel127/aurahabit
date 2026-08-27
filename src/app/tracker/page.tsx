"use client";

import { useState, useEffect } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { YearlyMatrixGrid } from "@/components/tracker/YearlyMatrixGrid";

export default function TrackerPage() {
  const [habits, setHabits] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);

  const fetchData = async () => {
    try {
      const [hRes, cRes] = await Promise.all([
        fetch("/api/habits"),
        fetch("/api/categories"),
      ]);
      const hData = await hRes.json();
      const cData = await cRes.json();

      if (Array.isArray(hData)) setHabits(hData);
      if (Array.isArray(cData)) setCategories(cData);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <AppShell title="Yearly Habit Tracker Grid">
      <YearlyMatrixGrid habits={habits} categories={categories} onRefresh={fetchData} />
    </AppShell>
  );
}
