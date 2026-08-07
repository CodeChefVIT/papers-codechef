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
    cardSurface: "bg-white dark:bg-[#120B24]",
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
    cardBorder: "border-[#D97706] dark:border-[#B45309]",
    cardSurface: "bg-white dark:bg-[#1C1305]",
    bannerSurface: "bg-[#FEF3C7] dark:bg-[#2A1C07]",
    chip: "bg-[#FDE8B8] dark:bg-[#3D290A]",
    chipIcon: "text-[#92600B] dark:text-[#FCD34D]",
    accentText: "text-[#92600B] dark:text-[#FBBF24]",
    cta: "bg-[#D97706] text-white hover:bg-[#B8630A] dark:bg-[#D97706] dark:hover:bg-[#B45309]",
    secondaryCta: "border border-[#D97706] text-[#92600B] hover:bg-[#FEF3C7] dark:border-[#F59E0B] dark:text-[#FCD34D] dark:hover:bg-[#3D290A]",
    tagText: "text-[#92600B] dark:text-[#FCD34D]",
    badgeBg: "bg-[#FEF3C7] text-[#92600B] dark:bg-[#3D290A] dark:text-[#FCD34D]",
  },
  green: {
    cardBorder: "border-[#16A34A] dark:border-[#15803D]",
    cardSurface: "bg-white dark:bg-[#071C0F]",
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
    cardSurface: "bg-white dark:bg-[#1F070C]",
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
        setDismissed(window.localStorage.getItem(storageKey) === "true");
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
    } catch {
      // ignore quota / security error
    }
    onDismiss?.();
  };

  if (!mounted || isExpired || (dismissible && dismissed)) return null;

  const styles = accentStyles[accent];

  if (variant === "banner") {
    return (
      <div
        role="region"
        aria-label={sponsored ? `Sponsored announcement: ${title}` : `Announcement: ${title}`}
        className={cn(
          "relative w-full font-play border-b border-purple-200/40 dark:border-purple-900/40 shadow-sm transition-all duration-200",
          styles.bannerSurface,
          className,
        )}
      >
        <div className="mx-auto flex max-w-screen-2xl flex-col items-start gap-3 px-4 py-2.5 sm:flex-row sm:items-center sm:gap-4 md:px-8">
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={imageAlt ?? title}
              width={36}
              height={36}
              className="h-8 w-8 flex-shrink-0 rounded-lg object-cover shadow-xs ring-1 ring-purple-500/20"
            />
          ) : (
            <EventLogo type={logoType} size="sm" className="flex-shrink-0" />
          )}

          <div className="flex min-w-0 flex-1 flex-col gap-0.5 sm:flex-row sm:items-center sm:gap-3">
            {badge && (
              <span className={cn("inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-bold tracking-wide uppercase shadow-xs", styles.badgeBg)}>
                {badge}
              </span>
            )}
            <span className={cn("whitespace-nowrap text-sm font-bold", styles.accentText)}>
              {title}
            </span>
            <span className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-200 sm:truncate">
              {message}
            </span>
          </div>

          <div className="flex w-full items-center justify-between gap-2.5 sm:w-auto sm:justify-end">
            {ctaLabel && href && (
              <SmartLink
                href={href}
                className={cn(
                  "inline-flex flex-shrink-0 items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-bold shadow-sm transition-all duration-200 hover:scale-105 active:scale-95",
                  styles.cta,
                )}
              >
                {ctaLabel}
                <ArrowUpRight className="h-3.5 w-3.5" />
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
                className={cn("flex-shrink-0 rounded-full p-1.5 transition-transform hover:scale-110 hover:opacity-80 active:scale-90", styles.accentText)}
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Card variant — sized to sit inside the same grid as paper Cards in Catalogue.
  return (
    <div
      role="region"
      aria-label={sponsored ? `Sponsored event: ${title}` : `Event: ${title}`}
      className={cn(
        "relative flex flex-col justify-between overflow-hidden rounded-sm border-2 font-play shadow-md transition-all duration-200 hover:shadow-xl dark:shadow-purple-950/20",
        styles.cardBorder,
        styles.cardSurface,
        className,
      )}
    >
      {/* NO X MARK button here when dismissible=false, ensuring in-feed grid event cards are persistent */}
      {dismissible && (
        <button
          onClick={handleDismiss}
          aria-label="Dismiss announcement"
          className="absolute right-2 top-2 z-20 rounded-full bg-black/50 p-1.5 text-white transition hover:bg-black/80 hover:scale-105"
        >
          <X className="h-3.5 w-3.5" />
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
            className="w-full object-cover p-2"
          />
        ) : (
          <div className="flex flex-col items-center justify-center gap-3">
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

          <h3 className="font-play text-xl font-bold leading-tight text-gray-900 dark:text-white">
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