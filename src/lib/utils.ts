import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import * as XLSX from "xlsx";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string = new Date()): string {
  const d = typeof date === "string" ? new Date(date) : date;
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function getDayOfYear(date: Date = new Date()): number {
  const start = new Date(date.getFullYear(), 0, 0);
  const diff = date.getTime() - start.getTime();
  const oneDay = 1000 * 60 * 60 * 24;
  return Math.floor(diff / oneDay);
}

export function calculateHabitStats(completions: Array<{ date: string; completed: boolean }>) {
  if (!completions || completions.length === 0) {
    return { currentStreak: 0, longestStreak: 0, completionRate: 0 };
  }

  const completedDatesSet = new Set(
    completions.filter((c) => c.completed).map((c) => c.date)
  );

  const today = new Date();
  let currentStreak = 0;
  let d = new Date(today);

  // Check today or yesterday as start of current streak
  let todayStr = formatDate(d);
  if (!completedDatesSet.has(todayStr)) {
    d.setDate(d.getDate() - 1);
    todayStr = formatDate(d);
  }

  while (completedDatesSet.has(todayStr)) {
    currentStreak++;
    d.setDate(d.getDate() - 1);
    todayStr = formatDate(d);
  }

  // Calculate longest streak
  const sortedDates = Array.from(completedDatesSet).sort();
  let longestStreak = 0;
  let tempStreak = 0;
  let prevDate: Date | null = null;

  for (const dateStr of sortedDates) {
    const currDate = new Date(dateStr);
    if (prevDate) {
      const diffDays = Math.round(
        (currDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24)
      );
      if (diffDays === 1) {
        tempStreak++;
      } else {
        tempStreak = 1;
      }
    } else {
      tempStreak = 1;
    }
    if (tempStreak > longestStreak) {
      longestStreak = tempStreak;
    }
    prevDate = currDate;
  }

  const totalCompleted = completedDatesSet.size;
  const completionRate = Math.round((totalCompleted / Math.max(completions.length, 1)) * 100);

  return {
    currentStreak,
    longestStreak,
    completionRate,
  };
}

export function calculateRealProgressStats(habits: any[]) {
  if (!habits || habits.length === 0) {
    return {
      totalHabits: 0,
      completedToday: 0,
      todayRate: 0,
      weeklyRate: 0,
      monthlyRate: 0,
      yearlyRate: 0,
      currentStreak: 0,
      bestStreak: 0,
      missedToday: 0,
    };
  }

  const today = new Date();
  const todayStr = formatDate(today);
  const currentYear = today.getFullYear();
  const currentMonthStr = `${currentYear}-${String(today.getMonth() + 1).padStart(2, "0")}`;
  const dayOfMonth = today.getDate();
  const dayOfYear = getDayOfYear(today);

  const totalHabits = habits.length;

  const allCompletions = habits.flatMap((h) => h.completions || []);
  const completedTodayCount = habits.filter((h) =>
    (h.completions || []).some((c: any) => c.date === todayStr && c.completed)
  ).length;

  const todayRate = Math.round((completedTodayCount / totalHabits) * 100);
  const missedToday = totalHabits - completedTodayCount;

  // Last 7 days dates array
  const last7Dates: string[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    last7Dates.push(formatDate(d));
  }

  const weeklyCompletions = allCompletions.filter(
    (c: any) => c.completed && last7Dates.includes(c.date)
  ).length;
  const expectedWeekly = totalHabits * 7;
  const weeklyRate = expectedWeekly > 0 ? Math.round((weeklyCompletions / expectedWeekly) * 100) : 0;

  const monthlyCompletions = allCompletions.filter(
    (c: any) => c.completed && c.date.startsWith(currentMonthStr)
  ).length;
  const expectedMonthly = totalHabits * dayOfMonth;
  const monthlyRate = expectedMonthly > 0 ? Math.round((monthlyCompletions / expectedMonthly) * 100) : 0;

  const yearlyCompletions = allCompletions.filter(
    (c: any) => c.completed && c.date.startsWith(String(currentYear))
  ).length;
  const expectedYearly = totalHabits * dayOfYear;
  const yearlyRate = expectedYearly > 0 ? Math.round((yearlyCompletions / expectedYearly) * 100) : 0;

  const habitStats = calculateHabitStats(allCompletions);

  return {
    totalHabits,
    completedToday: completedTodayCount,
    todayRate,
    weeklyRate,
    monthlyRate,
    yearlyRate,
    currentStreak: habitStats.currentStreak,
    bestStreak: Math.max(habitStats.longestStreak, habitStats.currentStreak),
    missedToday,
  };
}

export function exportToXLSX(data: any[], fileName: string = "habit-tracker-export") {
  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Data");
  XLSX.writeFile(workbook, `${fileName}.xlsx`);
}

export function exportToCSV(data: any[], fileName: string = "habit-tracker-export") {
  const worksheet = XLSX.utils.json_to_sheet(data);
  const csvOutput = XLSX.utils.sheet_to_csv(worksheet);
  const blob = new Blob([csvOutput], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  link.setAttribute("href", url);
  link.setAttribute("download", `${fileName}.csv`);
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
