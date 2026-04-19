"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Download } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{
    outcome: "accepted" | "dismissed";
    platform: string;
  }>;
}

const PWAInstallButton = () => {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [canInstall, setCanInstall] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setCanInstall(true);
    };

    window.addEventListener("beforeinstallprompt", handler);

    return () => {
      window.removeEventListener("resize", checkMobile);
      window.removeEventListener("beforeinstallprompt", handler);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setCanInstall(false);
      setDeferredPrompt(null);
    }
  };

  if (!canInstall) return null;

  return (
    <>
      <div className="flex w-fit items-center justify-between 
        gap-1.5 
        rounded-full border border-[#3A3745] 
        bg-[#e8e9ff] dark:bg-black 
        px-2.5 py-1.5 
        text-xs font-medium text-gray-700 
        shadow-md transition 
        hover:bg-slate-50 dark:text-white dark:hover:bg-[#2b2b30] 
        md:hidden h-9">
        <div className="flex items-center gap-3">
          <Image
            src="/assets/images/papers_logo.png"
            alt="Papers App"
            width={32}
            height={32}
          />
          <span className="text-lg font-semibold">Papers App</span>
        </div>
        <button
          onClick={handleInstall}
          className="ml-6 flex items-center gap-2 rounded-full border border-[#3A3745] bg-[#e8e9ff] px-4 py-1 text-sm font-semibold text-gray-700 transition hover:bg-slate-50 dark:bg-black dark:text-white dark:hover:bg-[#1A1823]"
        >
          <Download className="h-4 w-4" />
          Install
        </button>
      </div>

      <div
        onClick={handleInstall}
        className="hidden md:flex 
          cursor-pointer items-center 
          gap-2 sm:gap-2.5 md:gap-3 
          rounded-full border border-[#3A3745] 
          bg-[#e8e9ff] dark:bg-black 
          px-3 sm:px-4 md:px-5 
          py-1.5 sm:py-2 
          text-sm sm:text-base 
          text-gray-700 dark:text-white 
          transition hover:bg-slate-50 dark:hover:bg-[#1A1823] 
          h-9 sm:h-10"
      >
        <Image src="/assets/images/papers_logo.png" alt="Papers App" width={28} height={28} />
        <span className="text-sm font-semibold">Papers App</span>
      </div>
    </>
  );
};

export default PWAInstallButton;
