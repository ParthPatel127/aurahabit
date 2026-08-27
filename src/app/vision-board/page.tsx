"use client";

import { AppShell } from "@/components/layout/AppShell";
import { VisionBoardGrid } from "@/components/vision/VisionBoardGrid";

export default function VisionBoardPage() {
  return (
    <AppShell title="Vision Board & Dream Goals">
      <VisionBoardGrid />
    </AppShell>
  );
}
