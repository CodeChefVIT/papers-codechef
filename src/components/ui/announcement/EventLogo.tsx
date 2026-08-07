"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface EventLogoProps {
  type?: "clueminati" | "cookoff" | "default";
  className?: string;
  size?: "sm" | "md" | "lg";
}

export function EventLogo({ type = "default", className, size = "md" }: EventLogoProps) {
  const sizeClasses = {
    sm: "h-8 w-8",
    md: "h-12 w-12",
    lg: "h-20 w-20 md:h-24 md:w-24",
  };

  if (type === "clueminati") {
    return (
      <div
        className={cn(
          "relative flex items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-950 via-purple-900 to-slate-900 p-2 shadow-lg shadow-purple-900/30 ring-1 ring-purple-500/30 transition-transform duration-300 hover:scale-105",
          sizeClasses[size],
          className
        )}
      >
        <svg
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="h-full w-full drop-shadow-[0_0_8px_rgba(168,85,247,0.6)]"
        >
          <defs>
            <linearGradient id="clueGlow" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#A855F7" />
              <stop offset="50%" stopColor="#6366F1" />
              <stop offset="100%" stopColor="#EC4899" />
            </linearGradient>
            <linearGradient id="clueLens" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#818CF8" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#C084FC" stopOpacity="0.1" />
            </linearGradient>
          </defs>
          {/* Cyber Eye / Magnifier Outer Ring */}
          <circle cx="46" cy="44" r="28" stroke="url(#clueGlow)" strokeWidth="6" strokeDasharray="140 10" />
          <circle cx="46" cy="44" r="28" fill="url(#clueLens)" />
          
          {/* Magnifier Handle */}
          <path d="M66 64 L84 84" stroke="url(#clueGlow)" strokeWidth="8" strokeLinecap="round" />
          
          {/* Inner Code Bracket / Mystery Lock Element */}
          <path d="M38 38 L32 44 L38 50" stroke="#FFFFFF" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M54 38 L60 44 L54 50" stroke="#FFFFFF" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="46" cy="44" r="3" fill="#38BDF8" />
          
          {/* Glowing Sparkles */}
          <path d="M22 22 L24 26 L28 28 L24 30 L22 34 L20 30 L16 28 L20 26 Z" fill="#F472B6" />
          <path d="M74 20 L75.5 23 L78.5 24.5 L75.5 26 L74 29 L72.5 26 L69.5 24.5 L72.5 23 Z" fill="#38BDF8" />
        </svg>
      </div>
    );
  }

  if (type === "cookoff") {
    return (
      <div
        className={cn(
          "relative flex items-center justify-center rounded-2xl bg-gradient-to-br from-amber-950 via-orange-900 to-slate-900 p-2 shadow-lg shadow-orange-900/30 ring-1 ring-orange-500/30 transition-transform duration-300 hover:scale-105",
          sizeClasses[size],
          className
        )}
      >
        <svg
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="h-full w-full drop-shadow-[0_0_8px_rgba(249,115,22,0.6)]"
        >
          <defs>
            <linearGradient id="cookFlame" x1="0%" y1="100%" x2="0%" y2="0%">
              <stop offset="0%" stopColor="#EA580C" />
              <stop offset="50%" stopColor="#F97316" />
              <stop offset="100%" stopColor="#FBBF24" />
            </linearGradient>
            <linearGradient id="hatGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FFFFFF" />
              <stop offset="100%" stopColor="#E2E8F0" />
            </linearGradient>
          </defs>
          
          {/* Tech Chef Hat Base */}
          <path
            d="M30 68 C30 55, 20 50, 32 35 C40 22, 60 22, 68 35 C80 50, 70 55, 70 68 Z"
            fill="url(#hatGrad)"
          />
          {/* Hat Ribbon / Code Bar */}
          <rect x="30" y="66" width="40" height="12" rx="4" fill="#EA580C" />
          <path d="M38 72 L43 72 M48 72 L58 72" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" />

          {/* Central Coding Flame */}
          <path
            d="M50 32 C46 40, 42 42, 45 50 C48 56, 55 54, 54 46 C57 52, 53 58, 50 60 C58 60, 62 52, 58 44 C56 40, 52 36, 50 32 Z"
            fill="url(#cookFlame)"
          />

          {/* Sparkles */}
          <path d="M18 40 L20 43 L23 45 L20 47 L18 50 L16 47 L13 45 L16 43 Z" fill="#FBBF24" />
          <path d="M80 34 L81.5 36.5 L84 38 L81.5 39.5 L80 42 L78.5 39.5 L76 38 L78.5 36.5 Z" fill="#F97316" />
        </svg>
      </div>
    );
  }

  // Default CodeChef-VIT Brand Logo Accent
  return (
    <div
      className={cn(
        "relative flex items-center justify-center rounded-2xl bg-gradient-to-br from-violet-950 via-purple-900 to-indigo-950 p-2 shadow-lg shadow-purple-900/30 ring-1 ring-violet-500/30 transition-transform duration-300 hover:scale-105",
        sizeClasses[size],
        className
      )}
    >
      <svg
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="h-full w-full drop-shadow-[0_0_8px_rgba(139,92,246,0.6)]"
      >
        <defs>
          <linearGradient id="brandGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#A78BFA" />
            <stop offset="100%" stopColor="#6366F1" />
          </linearGradient>
        </defs>
        <rect x="15" y="15" width="70" height="70" rx="18" stroke="url(#brandGrad)" strokeWidth="6" fill="none" />
        <path d="M35 38 L25 50 L35 62" stroke="#A78BFA" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M65 38 L75 50 L65 62" stroke="#A78BFA" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M54 34 L44 66" stroke="#38BDF8" strokeWidth="6" strokeLinecap="round" />
      </svg>
    </div>
  );
}
