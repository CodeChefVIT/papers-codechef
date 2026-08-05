"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { X, Megaphone, ArrowUpRight, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export type AnnouncementAccent = "purple" | "amber" | "green" | "rose";
export type AnnouncementVariant = "banner" | "card";

export interface AnnouncementProps {
  /**
   * Stable, unique id for this announcement (e.g. "cookoff-2026").
   * Used as the localStorage key so a dismissal is remembered per-campaign,
   * not globally — dismissing one promo doesn't hide future ones.
   */
  id: string;
  title: string;
  message: string;
  variant?: AnnouncementVariant;
  /** Call-to-action label, e.g. "Register now". Omit to render without a CTA. */
  ctaLabel?: string;
  /** Where the CTA (and, for banners, the whole strip) links to. External links open in a new tab automatically. */
  href?: string;
  /** Card-variant only: image shown above the copy (16:9). Ignored for banners. */
  imageUrl?: string;
  imageAlt?: string;
  /** Custom lucide icon; defaults to a megaphone. */
  icon?: LucideIcon;
  /** Color preset. Pick based on urgency/category, not vibes: purple = general promo, amber = time-sensitive, green = opportunity/open, rose = urgent/closing soon. */
  accent?: AnnouncementAccent;
  /** Whether the person can dismiss it. Defaults to true. */
  dismissible?: boolean;
  /** ISO date string. Past this date the announcement stops rendering, dismissed or not — no stale promos. */
  expiresAt?: string;
  /** Shows a small "Sponsored" tag for transparency. Defaults to true — this is an ad, say so. */
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
    tagText: string;
  }
> = {
  purple: {
    cardBorder: "border-[#734DFF] dark:border-[#36266D]",
    cardSurface: "bg-white dark:bg-[#171720]",
    bannerSurface: "bg-[#EFEAFF] dark:bg-[#171720]",
    chip: "bg-[#EFEAFF] dark:bg-[#262635]",
    chipIcon: "text-[#562EE7] dark:text-[#A79DFF]",
    accentText: "text-[#562EE7] dark:text-[#A79DFF]",
    cta: "bg-[#734DFF] text-white hover:bg-[#5F3FE0]",
    tagText: "text-[#734DFF] dark:text-[#A79DFF]",
  },
  amber: {
    cardBorder: "border-[#d97706] dark:border-[#7c4a08]",
    cardSurface: "bg-white dark:bg-[#171720]",
    bannerSurface: "bg-[#fef3c7] dark:bg-[#3a2a05]",
    chip: "bg-[#fde8b8] dark:bg-[#4a3608]",
    chipIcon: "text-[#92600b] dark:text-[#f5c451]",
    accentText: "text-[#92600b] dark:text-[#f5c451]",
    cta: "bg-[#d97706] text-white hover:bg-[#b8630a]",
    tagText: "text-[#92600b] dark:text-[#f5c451]",
  },
  green: {
    cardBorder: "border-[#16a34a] dark:border-[#0f6b32]",
    cardSurface: "bg-white dark:bg-[#171720]",
    bannerSurface: "bg-[#dcfce7] dark:bg-[#052e13]",
    chip: "bg-[#c7f7d4] dark:bg-[#0b3d1c]",
    chipIcon: "text-[#15803d] dark:text-[#6ee7a0]",
    accentText: "text-[#15803d] dark:text-[#6ee7a0]",
    cta: "bg-[#16a34a] text-white hover:bg-[#128a3e]",
    tagText: "text-[#15803d] dark:text-[#6ee7a0]",
  },
  rose: {
    cardBorder: "border-[#e11d48] dark:border-[#8a0f2c]",
    cardSurface: "bg-white dark:bg-[#171720]",
    bannerSurface: "bg-[#ffe4e6] dark:bg-[#3f0d16]",
    chip: "bg-[#ffd2d6] dark:bg-[#521022]",
    chipIcon: "text-[#be123c] dark:text-[#fda4b0]",
    accentText: "text-[#be123c] dark:text-[#fda4b0]",
    cta: "bg-[#e11d48] text-white hover:bg-[#c11640]",
    tagText: "text-[#be123c] dark:text-[#fda4b0]",
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

/**
 * Reusable promo/announcement unit for advertising events, deadlines, or
 * sponsors on the papers site. Two variants:
 *
 *  - "banner": a thin dismissible strip, meant for the top of a page.
 *  - "card": a promo card sized to match `Card.tsx`, meant to sit inside
 *     the same paper grid (`grid-cols-1 md:grid-cols-2 lg:grid-cols-4`) as
 *     a native-feeling in-feed ad.
 *
 * Dismissal is remembered per `id` in localStorage, and an optional
 * `expiresAt` retires the announcement automatically so stale promos never
 * linger after an event has passed.
 */
export default function Announcement({
  id,
  title,
  message,
  variant = "banner",
  ctaLabel,
  href,
  imageUrl,
  imageAlt,
  icon: Icon = Megaphone,
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

  const handleDismiss = () => {
    setDismissed(true);
    try {
      window.localStorage.setItem(storageKey, "true");
    } catch {
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
          "relative w-full font-play",
          styles.bannerSurface,
          className,
        )}
      >
        <div className="mx-auto flex max-w-screen-2xl flex-col items-start gap-3 px-4 py-3 sm:flex-row sm:items-center sm:gap-4 md:px-8">
          <div className={cn("flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full", styles.chip)}>
            <Icon className={cn("h-5 w-5", styles.chipIcon)} />
          </div>

          <div className="flex min-w-0 flex-1 flex-col gap-0.5 sm:flex-row sm:items-center sm:gap-2">
            <span className={cn("whitespace-nowrap text-sm font-semibold", styles.accentText)}>
              {title}
            </span>
            <span className="text-sm text-gray-700 dark:text-gray-300 sm:truncate">
              {message}
            </span>
          </div>

          <div className="flex w-full items-center justify-between gap-3 sm:w-auto sm:justify-end">
            {sponsored && (
              <span className={cn("text-[10px] font-semibold uppercase tracking-wide opacity-70", styles.tagText)}>
                Sponsored
              </span>
            )}

            {ctaLabel && href && (
              <SmartLink
                href={href}
                className={cn(
                  "inline-flex flex-shrink-0 items-center gap-1 rounded-full px-3 py-1.5 text-xs font-semibold transition-colors",
                  styles.cta,
                )}
              >
                {ctaLabel}
                <ArrowUpRight className="h-3.5 w-3.5" />
              </SmartLink>
            )}

            {dismissible && (
              <button
                onClick={handleDismiss}
                aria-label="Dismiss announcement"
                className={cn("flex-shrink-0 rounded-full p-1 transition hover:opacity-70", styles.accentText)}
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Card variant — sized to sit inside the same grid as paper Cards.
  return (
    <div
      role="region"
      aria-label={sponsored ? `Sponsored announcement: ${title}` : `Announcement: ${title}`}
      className={cn(
        "relative flex flex-col overflow-hidden rounded-sm border-2 font-play transition-all duration-150",
        styles.cardBorder,
        styles.cardSurface,
        className,
      )}
    >
      {dismissible && (
        <button
          onClick={handleDismiss}
          aria-label="Dismiss announcement"
          className="absolute right-2 top-2 z-10 rounded-full bg-black/40 p-1 text-white transition hover:bg-black/60"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      )}

      {imageUrl ? (
        <Image
          src={imageUrl}
          alt={imageAlt ?? title}
          width={320}
          height={180}
          className="w-full object-cover p-4 pb-3 md:h-[250px]"
        />
      ) : (
        <div className={cn("m-4 mb-0 flex h-[150px] items-center justify-center rounded-sm md:h-[218px]", styles.chip)}>
          <Icon className={cn("h-10 w-10", styles.chipIcon)} />
        </div>
      )}

      <div className="flex flex-1 flex-col justify-between space-y-3 p-4">
        <div className="space-y-1.5">
          {sponsored && (
            <span className={cn("text-[10px] font-semibold uppercase tracking-wide opacity-70", styles.tagText)}>
              Sponsored
            </span>
          )}
          <div className="font-play text-lg font-semibold leading-snug">{title}</div>
          <p className="text-sm text-gray-600 dark:text-gray-400">{message}</p>
        </div>

        {ctaLabel && href && (
          <SmartLink
            href={href}
            className={cn(
              "inline-flex w-fit items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold transition-colors",
              styles.cta,
            )}
          >
            {ctaLabel}
            <ArrowUpRight className="h-4 w-4" />
          </SmartLink>
        )}
      </div>
    </div>
  );
}