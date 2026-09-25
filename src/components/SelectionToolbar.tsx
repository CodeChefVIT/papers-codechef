"use client";

import React from "react";
import { CheckSquare, Square, Download, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface SelectionToolbarProps {
  selectedCount: number;
  totalCount: number;
  onSelectAll: () => void;
  onDeselectAll: () => void;
  onDownload: () => void;
  isDownloading: boolean;
}

const SelectionToolbar: React.FC<SelectionToolbarProps> = ({
  selectedCount,
  totalCount,
  onSelectAll,
  onDeselectAll,
  onDownload,
  isDownloading,
}) => {
  const allSelected = totalCount > 0 && selectedCount === totalCount;
  const hasSelection = selectedCount > 0;

  return (
    <div className="flex items-center gap-2 rounded-full border-2 border-black bg-white p-1 pl-3 font-play text-xs font-semibold shadow-[2px_2px_0_0_#000] dark:border-[#434dba] dark:bg-[#0a0118] dark:shadow-[2px_2px_0_0_#434dba]">
      <span
        className={cn(
          "min-w-[64px] select-none text-gray-500 transition-colors dark:text-gray-400",
          hasSelection && "text-[#5B4CDB] dark:text-[#B2B8FF]",
        )}
      >
        {selectedCount} / {totalCount} selected
      </span>

      <div className="h-5 w-px bg-black/10 dark:bg-white/10" />

      <button
        type="button"
        onClick={allSelected ? onDeselectAll : onSelectAll}
        className="flex items-center gap-1.5 rounded-full px-3 py-1.5 transition-colors hover:bg-[#B2B8FF] hover:text-black dark:hover:bg-[#434dba] dark:hover:text-white"
        aria-pressed={allSelected}
      >
        {allSelected ? (
          <CheckSquare size={16} className="text-[#7480FF]" />
        ) : (
          <Square size={16} />
        )}
        <span className="hidden sm:inline">
          {allSelected ? "Deselect All" : "Select All"}
        </span>
        <span className="sm:hidden">{allSelected ? "None" : "All"}</span>
      </button>

      <button
        type="button"
        onClick={onDownload}
        disabled={!hasSelection || isDownloading}
        aria-busy={isDownloading}
        className={cn(
          "flex items-center gap-1.5 rounded-full bg-black px-3 py-1.5 text-white transition-colors dark:bg-[#7480FF]",
          hasSelection && !isDownloading
            ? "hover:bg-[#7480FF] dark:hover:bg-[#B2B8FF] dark:hover:text-black"
            : "cursor-not-allowed opacity-40",
        )}
      >
        {isDownloading ? (
          <Loader2 size={16} className="animate-spin" />
        ) : (
          <Download size={16} />
        )}
        <span className="hidden sm:inline">
          {isDownloading
            ? "Zipping…"
            : hasSelection
              ? `Download (${selectedCount})`
              : "Download Selected"}
        </span>
        <span className="sm:hidden">
          {isDownloading ? "Zipping…" : `Download${hasSelection ? ` (${selectedCount})` : ""}`}
        </span>
      </button>
    </div>
  );
};

export default SelectionToolbar;
