"use client";

import { Info, X } from "lucide-react";
import { useEffect, useState } from "react";

interface BannerProps {
  bannerId: string;
  bgColor?: string;
  textColor?: string;
  iconColor?: string;
  accentColor?: string;
  message: string;
  title: string;
}

export default function Banner({
  bannerId,
  bgColor = "#EFEAFF",
  textColor = "#120B24",
  iconColor = "#562EE7",
  accentColor = "#562EE7",
  message,
  title,
}: BannerProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const bannerStatus = localStorage.getItem("banner_" + bannerId);
    if (bannerStatus !== "dismissed") {
      setVisible(true);
    }
  }, [bannerId]);

  const closeBanner = () => {
    localStorage.setItem("banner_" + bannerId, "dismissed");
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="z-[60] w-full shadow-sm" style={{ backgroundColor: bgColor, color: textColor }}>
      <div className="relative mx-auto flex max-w-screen-2xl flex-col items-start justify-between gap-3 px-4 py-3 sm:justify-center sm:flex-row sm:items-center sm:gap-4 md:px-8 md:py-3">
        <div className="flex items-center gap-2">
          <Info className="h-5 w-5" style={{ color: iconColor }} />
          <span className="font-semibold text-base tracking-wide" style={{ color: accentColor }}>
            {title}
          </span>
        </div>

        <p className="text-sm flex-1 sm:text-right">{message}</p>

        <button
          onClick={closeBanner}
          className="absolute right-4 transition hover:opacity-75 sm:static sm:self-start"
          aria-label="Dismiss banner"
          style={{ color: accentColor }}
        >
          <X className="text-sm"/>
        </button>
      </div>
    </div>
  );
}
