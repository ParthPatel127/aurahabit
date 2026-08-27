"use client";

import { Sidebar } from "@/components/layout/Sidebar";
import { Navbar } from "@/components/layout/Navbar";
import { useSidebar } from "@/components/providers/SidebarProvider";
import { cn } from "@/lib/utils";

export function AppShell({ children, title }: { children: React.ReactNode; title: string }) {
  const { collapsed } = useSidebar();

  return (
    <div className="min-h-screen flex bg-slate-50 dark:bg-slate-950">
      <Sidebar />
      <div
        className={cn(
          "flex-1 transition-all duration-300 flex flex-col min-h-screen",
          collapsed ? "md:pl-20" : "md:pl-64"
        )}
      >
        <Navbar title={title} />
        <main className="flex-1 p-4 md:p-8 max-w-7xl w-full mx-auto space-y-6">
          {children}
        </main>
      </div>
    </div>
  );
}
