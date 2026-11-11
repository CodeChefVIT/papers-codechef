"use client";

import { useEffect } from "react";
import { cn } from "@/lib/utils";
import { describeCount, sendPaperActivity, usePaperCounts } from "@/lib/utils/paper-counts";

const viewedOnThisPage = new Set<string>();

interface PaperCountsLineProps {
  paperId: string;
  views?: number;
  downloads?: number;
  countView?: boolean;
  className?: string;
}

export default function PaperCountsLine({
  paperId,
  views = 0,
  downloads = 0,
  countView = false,
  className,
}: PaperCountsLineProps) {
  const counts = usePaperCounts(paperId, { views, downloads });

  useEffect(() => {
    if (!countView || viewedOnThisPage.has(paperId)) return;
    viewedOnThisPage.add(paperId);
    void sendPaperActivity("view", [paperId]);
  }, [countView, paperId]);

  return (
    <span className={cn("font-play text-sm opacity-70", className)}>
      {describeCount(counts.views, "view")} · {describeCount(counts.downloads, "download")}
    </span>
  );
}
