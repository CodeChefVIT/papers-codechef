"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { useState } from "react";
import { ChevronDown, UploadIcon } from "lucide-react";
import ModeToggle from "./toggle-theme";

import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import PinnedModal from "./ui/PinnedModal";
import RequestModal from "./ui/RequestModal";

interface Props {
  onNavigate: () => void;
}

export default function FloatingNavbar({ onNavigate }: Props) {
  const pathname = usePathname();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  return (
    <div className="flex flex-col items-end h-full space-y-4 pointer-events-none">
      <DropdownMenu open={dropdownOpen} onOpenChange={setDropdownOpen}>
        <DropdownMenuTrigger asChild>
          <button
            className="flex h-9 w-9 items-center justify-center rounded-full border border-[#3A3745] bg-[#e8e9ff] text-gray-700 hover:bg-slate-50 dark:bg-[#1E1B2E] dark:text-white dark:hover:bg-[#2A263D] shadow-lg transition-transform duration-200 hover:scale-105 active:scale-95 pointer-events-auto"
            aria-label="Toggle dropdown"
          >
            <ChevronDown
              className={`h-4 w-4 transition-transform duration-200 ${dropdownOpen ? "rotate-180" : ""}`}
            />
          </button>
        </DropdownMenuTrigger>

        <DropdownMenuContent
          className="xl:hidden mt-2 p-1.5 w-48 space-y-0.5 rounded-xl 
          border border-[#3A3745] shadow-xl backdrop-blur-md transition-colors
          bg-[#e8e9ff] text-gray-800 
          dark:bg-[#181528] dark:text-white dark:border-[#3A3745]"
          align="end"
        >
          <DropdownMenuItem asChild className="rounded-lg px-2.5 py-1.5 hover:bg-slate-200 dark:hover:bg-[#1F2A3D] dark:focus:bg-[#1F2A3D] cursor-pointer">
            <Link
              href={pathname === "/upload" ? "/" : "/upload"}
              onClick={() => onNavigate()}
              className="flex w-full items-center gap-2.5 bg-transparent hover:bg-transparent"
            >
              <UploadIcon className="h-4 w-4" />
              <span className="text-xs font-medium">
                {pathname === "/upload" ? "Search Papers" : "Upload Papers"}
              </span>
            </Link>
          </DropdownMenuItem>

          <DropdownMenuItem
            onSelect={(e) => e.preventDefault()}
            className="rounded-lg px-2.5 py-1.5 hover:bg-slate-200 dark:hover:bg-[#1F2A3D] dark:focus:bg-[#1F2A3D] cursor-pointer"
          >
            <PinnedModal />
          </DropdownMenuItem>

          <DropdownMenuItem
            onSelect={(e) => e.preventDefault()}
            className="rounded-lg px-2.5 py-1.5 hover:bg-slate-200 dark:hover:bg-[#1F2A3D] dark:focus:bg-[#1F2A3D] cursor-pointer"
          >
            <RequestModal />
          </DropdownMenuItem>

          <div className="pt-1 mt-1 border-t border-gray-300 dark:border-[#2E2B3E] flex items-center justify-between px-2.5 py-1">
            <span className="text-[11px] text-gray-500 dark:text-gray-400 font-medium">Theme</span>
            <div className="border border-gray-300 dark:border-[#3A3745] rounded-full p-0.5 scale-90">
              <ModeToggle />
            </div>
          </div>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
