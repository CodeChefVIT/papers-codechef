"use client";

import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { Copy } from "lucide-react";
import toast from "react-hot-toast";
import { FaShare } from "react-icons/fa";
import QR from "./qr";
import { Button } from "./ui/button";
import { usePathname } from "next/navigation";

export default function ShareButton() {
  const [origin, setOrigin] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      setOrigin(window.location.origin);
    }
  }, []);

  const pathname = usePathname();
  const paperPath = origin + pathname;
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="aspect-square h-10 w-10 p-0">
          <FaShare />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-96">
        <DialogHeader>
          <DialogTitle>Share Papers with your friends!</DialogTitle>
          <DialogDescription>
            Either scan the QR or copy the link and share
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col items-center justify-center gap-5">
          <QR url={paperPath}></QR>
          <Button
            type="submit"
            size="sm"
            className="flex w-fit items-center justify-between gap-5 px-3"
            onClick={async () => {
              await toast.promise(
                navigator.clipboard.writeText(paperPath), // This is a promise
                {
                  success: "Link copied successfully",
                  loading: "Copying link...",
                  error: "Error copying link",
                },
              );
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
