"use client";

import React, { useEffect, useRef, useState } from "react";
import {
  Dialog,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogContent,
} from "./ui/dialog";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { Copy } from "lucide-react";
import toast from "react-hot-toast";
import { FaShare } from "react-icons/fa";
import QR from "./qr";
import { Button } from "./ui/button";
import { usePathname } from "next/navigation";

interface ShareButtonProps {
  isFullscreen: boolean;
  viewerRef: React.RefObject<HTMLDivElement>;
}

export default function ShareButton({ isFullscreen, viewerRef }: ShareButtonProps) {
  const [origin, setOrigin] = useState("");
  const pathname = usePathname();

  useEffect(() => {
    setOrigin(window.location.origin);
  }, []);

  const paperPath = origin + pathname;
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          className="aspect-square h-10 w-10 p-0 rounded text-white bg-[#6536c1] transition hover:bg-[#7d4fc7]"
          title="Share this paper"
        >
          <FaShare />
        </Button>
      </DialogTrigger>
      <DialogContent
        container={isFullscreen ? viewerRef.current : document.body}
        className="max-w-96"
      >
        <DialogHeader>
          <DialogTitle>Share Papers with your friends!</DialogTitle>
          <DialogDescription>
            Either scan the QR or copy the link and share
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col items-center justify-center gap-5">
          <QR url={paperPath} />
          <Button
            type="button"
            size="sm"
            className="flex w-fit items-center justify-between gap-5 px-3"
            title="Copy link to clipboard"
            onClick={async () => {
              await toast.promise(navigator.clipboard.writeText(paperPath), {
                success: "Link copied successfully",
                loading: "Copying link...",
                error: "Error copying link",
              });
            }}
          >
            <p>Copy Link To Clipboard</p>
            <Copy />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}