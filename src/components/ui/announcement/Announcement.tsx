"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { X, ArrowUpRight, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";
import { EventLogo } from "./EventLogo";

export type AnnouncementAccent = "purple" | "amber" | "green" | "rose";
export type AnnouncementVariant = "banner" | "card";

export interface AnnouncementProps {
  id: string;
  title: string;
  message: string;
  variant?: AnnouncementVariant;
  ctaLabel?: string;
  href?: string;
  secondaryCtaLabel?: string;
  secondaryHref?: string;
  imageUrl?: string;
  imageAlt?: string;
  logoType?: "clueminati" | "cookoff" | "default";
  badge?: string;
  accent?: AnnouncementAccent;
  dismissible?: boolean;
  expiresAt?: string;
  sponsored?: boolean;
  onDismiss?: () => void;
  className?: string;
}

const accentStyles: Record<
  AnnouncementAccent,
  {
    cardBorder: string;
    cardSurface: string;
    bannerSurface: string;
    chip: string;
    chipIcon: string;
    accentText: string;
    cta: string;
    secondaryCta: string;
    tagText: string;
    badgeBg: string;
  }
> = {
  purple: {
    cardBorder: "border-[#734DFF] dark:border-[#562EE7]",
    cardSurface: "bg-white dark:bg-[#120B24] hover:bg-[#EFEAFF] hover:dark:bg-[#1D1438]",
    bannerSurface: "bg-[#EFEAFF] dark:bg-[#1A1133]",
    chip: "bg-[#EFEAFF] dark:bg-[#231845]",
    chipIcon: "text-[#562EE7] dark:text-[#C4B5FD]",
    accentText: "text-[#562EE7] dark:text-[#A78BFA]",
    cta: "bg-[#734DFF] text-white hover:bg-[#5F3FE0] dark:bg-[#6D28D9] dark:hover:bg-[#5B21B6]",
    secondaryCta: "border border-[#734DFF] text-[#562EE7] hover:bg-[#EFEAFF] dark:border-[#7C3AED] dark:text-[#C4B5FD] dark:hover:bg-[#2E1A47]",
    tagText: "text-[#734DFF] dark:text-[#C4B5FD]",
    badgeBg: "bg-[#EFEAFF] text-[#562EE7] dark:bg-[#2E1A47] dark:text-[#C4B5FD]",
  },
  amber: {
    cardBorder: "border-[#734DFF] dark:border-[#562EE7]",
    cardSurface: "bg-white dark:bg-[#120B24] hover:bg-[#EFEAFF] hover:dark:bg-[#1D1438]",
    bannerSurface: "bg-[#EFEAFF] dark:bg-[#1A1133]",
    chip: "bg-[#EFEAFF] dark:bg-[#231845]",
    chipIcon: "text-[#562EE7] dark:text-[#C4B5FD]",
    accentText: "text-[#562EE7] dark:text-[#A78BFA]",
    cta: "bg-[#734DFF] text-white hover:bg-[#5F3FE0] dark:bg-[#6D28D9] dark:hover:bg-[#5B21B6]",
    secondaryCta: "border border-[#734DFF] text-[#562EE7] hover:bg-[#EFEAFF] dark:border-[#7C3AED] dark:text-[#C4B5FD] dark:hover:bg-[#2E1A47]",
    tagText: "text-[#734DFF] dark:text-[#C4B5FD]",
    badgeBg: "bg-[#EFEAFF] text-[#562EE7] dark:bg-[#2E1A47] dark:text-[#C4B5FD]",
  },
  green: {
    cardBorder: "border-[#16A34A] dark:border-[#15803D]",
    cardSurface: "bg-white dark:bg-[#071C0F] hover:bg-[#DCFCE7] hover:dark:bg-[#0E2918]",
    bannerSurface: "bg-[#DCFCE7] dark:bg-[#0B331A]",
    chip: "bg-[#C7F7D4] dark:bg-[#124D28]",
    chipIcon: "text-[#15803D] dark:text-[#86EFAC]",
    accentText: "text-[#15803D] dark:text-[#4ADE80]",
    cta: "bg-[#16A34A] text-white hover:bg-[#128A3E]",
    secondaryCta: "border border-[#16A34A] text-[#15803D] hover:bg-[#DCFCE7] dark:border-[#22C55E] dark:text-[#86EFAC] dark:hover:bg-[#124D28]",
    tagText: "text-[#15803D] dark:text-[#86EFAC]",
    badgeBg: "bg-[#DCFCE7] text-[#15803D] dark:bg-[#124D28] dark:text-[#86EFAC]",
  },
  rose: {
    cardBorder: "border-[#E11D48] dark:border-[#BE123C]",
    cardSurface: "bg-white dark:bg-[#1F070C] hover:bg-[#FFE4E6] hover:dark:bg-[#2F0B13]",
    bannerSurface: "bg-[#FFE4E6] dark:bg-[#380D17]",
    chip: "bg-[#FFD2D6] dark:bg-[#521323]",
    chipIcon: "text-[#BE123C] dark:text-[#FDA4AF]",
    accentText: "text-[#BE123C] dark:text-[#FB7185]",
    cta: "bg-[#E11D48] text-white hover:bg-[#C11640]",
    secondaryCta: "border border-[#E11D48] text-[#BE123C] hover:bg-[#FFE4E6] dark:border-[#F43F5E] dark:text-[#FDA4AF] dark:hover:bg-[#521323]",
    tagText: "text-[#BE123C] dark:text-[#FDA4AF]",
    badgeBg: "bg-[#FFE4E6] text-[#BE123C] dark:bg-[#521323] dark:text-[#FDA4AF]",
  },
};

function isExternal(href: string): boolean {
  return /^https?:\/\//i.test(href);
}

function SmartLink({
  href,
  className,
  children,
  ariaLabel,
}: {
  href: string;
  className?: string;
  children: React.ReactNode;
  ariaLabel?: string;
}) {
  if (isExternal(href)) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={className}
        aria-label={ariaLabel}
      >
        {children}
      </a>
    );
  }
  return (
    <Link href={href} className={className} aria-label={ariaLabel}>
      {children}
    </Link>
  );
}

export default function Announcement({
  id,
  title,
  message,
  variant = "banner",
  ctaLabel,
  href,
  secondaryCtaLabel,
  secondaryHref,
  imageUrl,
  imageAlt,
  logoType = "default",
  badge,
  accent = "purple",
  dismissible = true,
  expiresAt,
  sponsored = true,
  onDismiss,
  className,
}: AnnouncementProps) {
  const [mounted, setMounted] = React.useState(false);
  const [dismissed, setDismissed] = React.useState(false);

  const storageKey = `announcement:${id}:dismissed`;

  const isExpired = React.useMemo(() => {
    if (!expiresAt) return false;
    const expiry = new Date(expiresAt);
    if (Number.isNaN(expiry.getTime())) return false;
    return Date.now() > expiry.getTime();
  }, [expiresAt]);

  React.useEffect(() => {
    setMounted(true);
    if (dismissible) {
      try {
        const timestampKey = `${storageKey}:time`;
        const isDismissed = window.localStorage.getItem(storageKey) === "true";
        const dismissedAt = window.localStorage.getItem(timestampKey);
        const FORTY_EIGHT_HOURS = 48 * 60 * 60 * 1000;

        if (isDismissed && dismissedAt) {
          const timePassed = Date.now() - parseInt(dismissedAt, 10);
          if (timePassed < FORTY_EIGHT_HOURS) {
            setDismissed(true);
          } else {
            window.localStorage.removeItem(storageKey);
            window.localStorage.removeItem(timestampKey);
            setDismissed(false);
          }
        } else if (isDismissed) {
          setDismissed(true);
        } else {
          setDismissed(false);
        }
      } catch {
        setDismissed(false);
      }
    }
  }, [storageKey, dismissible]);

  const handleDismiss = (e: React.MouseEvent) => {
    e.stopPropagation();
    setDismissed(true);
    try {
      window.localStorage.setItem(storageKey, "true");
      window.localStorage.setItem(`${storageKey}:time`, Date.now().toString());
    } catch {
      // ignore quota / security error
    }
    onDismiss?.();
  };

  if (!mounted || isExpired || (dismissible && dismissed)) return null;

  const styles = accentStyles[accent];

  const handleBannerClick = (e: React.MouseEvent) => {
    if (!href) return;
    const target = e.target as HTMLElement;
    if (target.closest("button, a, input, svg")) return;

    if (isExternal(href)) {
      window.open(href, "_blank", "noopener,noreferrer");
    } else {
      window.location.href = href;
    }
  };

  if (variant === "banner") {
    return (
      <div
        role="region"
        aria-label={sponsored ? `Sponsored announcement: ${title}` : `Announcement: ${title}`}
        onClick={handleBannerClick}
        className={cn(
          "relative w-full font-play border-b border-purple-200/40 dark:border-purple-900/40 shadow-xs transition-all duration-200",
          href && "cursor-pointer",
          styles.bannerSurface,
          className,
        )}
      >
        <div className="relative flex w-full items-center justify-between gap-3 px-4 py-2.5 md:px-8">
          {/* Info section - grouped neatly right next to the logo */}
          <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-3">
            {imageUrl ? (
              <Image
                src={imageUrl}
                alt={imageAlt ?? title}
                width={32}
                height={32}
                className="h-7 w-7 flex-shrink-0 rounded-lg object-cover shadow-xs ring-1 ring-purple-500/20 sm:h-8 sm:w-8"
              />
            ) : (
              <EventLogo type={logoType} size="sm" className="flex-shrink-0 scale-90 sm:scale-100" />
            )}

            <div className="flex min-w-0 items-center gap-1.5 sm:gap-2.5">
              {badge && (
                <span className={cn("inline-flex items-center rounded-full px-2 py-0.5 text-[10px] sm:text-[11px] font-bold tracking-wide uppercase shadow-xs flex-shrink-0", styles.badgeBg)}>
                  {badge}
                </span>
              )}

              <span className={cn("truncate text-xs sm:text-sm font-bold", styles.accentText)}>
                {title}
              </span>

              <span className="truncate text-xs font-medium text-gray-700 dark:text-gray-200 hidden md:inline-block">
                {message}
              </span>
            </div>
          </div>

          {/* Right Action & Dismiss buttons */}
          <div className="flex flex-shrink-0 items-center gap-1 sm:gap-2.5">
            {ctaLabel && href && (
              <SmartLink
                href={href}
                className={cn(
                  "inline-flex flex-shrink-0 items-center gap-1 rounded-full px-2 py-1 sm:px-3.5 sm:py-1.5 text-[10px] sm:text-xs font-bold shadow-xs transition-all duration-200 hover:scale-105 active:scale-95",
                  styles.cta,
                )}
              >
                <span>{ctaLabel}</span>
                <ArrowUpRight className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
              </SmartLink>
            )}

            {secondaryCtaLabel && secondaryHref && (
              <SmartLink
                href={secondaryHref}
                className={cn(
                  "inline-flex flex-shrink-0 items-center gap-1 rounded-full px-3 py-1.5 text-xs font-bold transition-all duration-200 hover:scale-105 active:scale-95 hidden lg:inline-flex",
                  styles.secondaryCta,
                )}
              >
                {secondaryCtaLabel}
                <ExternalLink className="h-3 w-3" />
              </SmartLink>
            )}

            {dismissible && (
              <button
                onClick={handleDismiss}
                aria-label="Dismiss announcement"
                className={cn("flex-shrink-0 rounded-full p-1 sm:p-1.5 transition-transform hover:scale-110 hover:opacity-80 active:scale-90", styles.accentText)}
              >
                <X className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  const handleCardClick = (e: React.MouseEvent) => {
    if (!href) return;
    const target = e.target as HTMLElement;
    if (target.closest("button, a, input, svg")) return;

    if (isExternal(href)) {
      window.open(href, "_blank", "noopener,noreferrer");
    } else {
      window.location.href = href;
    }
  };

  // Card variant — sized to sit inside the same grid as paper Cards in Catalogue.
  return (
    <div
      role="region"
      aria-label={sponsored ? `Sponsored event: ${title}` : `Event: ${title}`}
      onClick={handleCardClick}
      className={cn(
        "group relative flex flex-col justify-between overflow-hidden rounded-sm border-2 font-play shadow-md transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl dark:shadow-purple-950/20",
        href && "cursor-pointer",
        styles.cardBorder,
        styles.cardSurface,
        className,
      )}
    >
      {dismissible && (
        <button
          onClick={handleDismiss}
          aria-label="Hide announcement"
          className="absolute right-2.5 top-2.5 z-20 flex items-center justify-center rounded-full bg-black/60 p-1.5 text-white shadow-md backdrop-blur-md transition-all hover:bg-black/80 hover:scale-110 active:scale-95"
        >
          <X className="h-4 w-4" />
        </button>
      )}

      {/* Header Banner Graphic / Image */}
      <div className="relative flex w-full flex-col items-center justify-center overflow-hidden bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-950 p-6 md:h-[220px]">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={imageAlt ?? title}
            width={320}
            height={180}
            className="w-full object-cover p-2 transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex flex-col items-center justify-center gap-3 transition-transform duration-300 group-hover:scale-105">
            <EventLogo type={logoType} size="lg" />
            {badge && (
              <span className={cn("inline-flex items-center rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider shadow-md", styles.badgeBg)}>
                {badge}
              </span>
            )}
          </div>
        )}
      </div>

      <div className="h-[1px] w-full bg-[#734DFF] dark:bg-[#562EE7]" />

      {/* Details & Copy */}
      <div className="flex flex-1 flex-col justify-between space-y-4 p-5">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className={cn("text-[11px] font-extrabold uppercase tracking-wider", styles.tagText)}>
              CodeChef-VIT Event
            </span>
            <span className="text-[10px] font-semibold text-gray-500 dark:text-gray-400">
              Gravitas &apos;26
            </span>
          </div>

          <h3 className="font-play text-xl font-bold leading-tight text-gray-900 dark:text-white transition-colors duration-200 group-hover:text-[#562EE7] dark:group-hover:text-[#A78BFA]">
            {title}
          </h3>
          <p className="text-xs md:text-sm font-medium leading-relaxed text-gray-600 dark:text-gray-300">
            {message}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2 pt-2">
          {ctaLabel && href && (
            <SmartLink
              href={href}
              className={cn(
                "inline-flex flex-1 items-center justify-center gap-1.5 rounded-md px-4 py-2.5 text-xs font-extrabold shadow-md transition-all duration-200 hover:scale-[1.02] active:scale-98",
                styles.cta,
              )}
            >
              {ctaLabel}
              <ArrowUpRight className="h-4 w-4" />
            </SmartLink>
          )}

          {secondaryCtaLabel && secondaryHref && (
            <SmartLink
              href={secondaryHref}
              className={cn(
                "inline-flex items-center justify-center gap-1 rounded-md px-3 py-2.5 text-xs font-bold transition-all duration-200 hover:scale-[1.02] active:scale-98",
                styles.secondaryCta,
              )}
            >
              {secondaryCtaLabel}
              <ExternalLink className="h-3.5 w-3.5" />
            </SmartLink>
          )}
        </div>
      </div>
    </div>
  );
}