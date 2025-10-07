"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { ChevronDown, Upload } from "lucide-react";

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

// Unified styling for all dropdown action rows
const itemBaseClasses =
  "flex w-full items-center gap-3 rounded-lg px-3 py-2 hover:bg-[#1A1823] transition";

function MenuItemRow({ children }: { children: React.ReactNode }) {
  return <div className={itemBaseClasses}>{children}</div>;
}

export default function FloatingNavbar({ onNavigate }: Props) {
  const pathname = usePathname();

  return (
    <div className="flex flex-col items-end h-full space-y-4 pointer-events-none">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            className="flex h-10 w-10 items-center justify-center rounded-full border border-[#3A3745] bg-[#e8e9ff] text-gray-700 hover:bg-slate-50 dark:bg-black dark:text-white dark:hover:bg-[#1A1823] shadow-lg transition-transform duration-200 hover:scale-105 active:scale-95 pointer-events-auto"
            aria-label="Toggle dropdown"
          >
            <ChevronDown className="h-5 w-5 transition-transform duration-200" />
          </button>
        </DropdownMenuTrigger>

        <DropdownMenuContent
          className="xl:hidden mt-2 py-2 w-72 space-y-1 rounded-3xl 
          border border-[#3A3745] shadow-lg backdrop-blur-sm transition-colors
          bg-[#e8e9ff] text-gray-700 
          dark:bg-black dark:text-white dark:border-[#3A3745]"
          align="end"
        >
          <DropdownMenuItem asChild>
            <Link
              href={pathname === "/upload" ? "/" : "/upload"}
              onClick={() => onNavigate()}
              className={itemBaseClasses}
            >
              <Upload className="h-4 w-4" />
              <span className="text-sm font-medium">
                {pathname === "/upload" ? "Search Papers" : "Upload Papers"}
              </span>
            </Link>
          </DropdownMenuItem>

          <DropdownMenuItem asChild>
            <MenuItemRow>
              <PinnedModal />
            </MenuItemRow>
          </DropdownMenuItem>

          <DropdownMenuItem asChild>
            <MenuItemRow>
              <RequestModal />
            </MenuItemRow>
          </DropdownMenuItem>

          <DropdownMenuItem asChild>
            <MenuItemRow>
              <div className="border rounded-full">
                <ModeToggle />
              </div>
            </MenuItemRow>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
