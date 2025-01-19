"use client";

import { Copy, Download, Eye, Maximize } from "lucide-react";
import { Worker } from "@react-pdf-viewer/core";
import { Viewer } from "@react-pdf-viewer/core";
import { FaShare } from "react-icons/fa";

import {
  zoomPlugin,
  ZoomInIcon,
  ZoomOutIcon,
  type RenderZoomOutProps,
  type RenderZoomInProps,
  type RenderCurrentScaleProps,
} from "@react-pdf-viewer/zoom";
import { getFilePlugin } from "@react-pdf-viewer/get-file";

import {
  fullScreenPlugin,
  type RenderEnterFullScreenProps,
} from "@react-pdf-viewer/full-screen";

import "@react-pdf-viewer/full-screen/lib/styles/index.css";
import "@react-pdf-viewer/core/lib/styles/index.css";
import "@react-pdf-viewer/zoom/lib/styles/index.css";
import Link from "next/link";
import QR from "./qr";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

interface Params {
  params: { id: string };
}

interface PdfViewerProps {
  url: string;
  name: string;
}

export default function PdfViewer({ url, name }: PdfViewerProps) {
  const [origin, setOrigin] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      setOrigin(window.location.origin);
    }
  }, []);

  const getFilePluginInstance = getFilePlugin({
    fileNameGenerator: () => {
      return name;
    },
  });
  const zoomPluginInstance = zoomPlugin();
  const { CurrentScale, ZoomIn, ZoomOut } = zoomPluginInstance;
  const fullScreenPluginInstance = fullScreenPlugin();
  const EnterFullScreen = fullScreenPluginInstance.EnterFullScreen.bind(
    fullScreenPluginInstance,
  );

  const pathname = usePathname();
  const paperPath = origin + pathname;
  return (
    <div>
      <div className="flex w-[95%] items-center justify-between bg-violet-400 px-4 py-4 dark:bg-gray-900 md:w-[80%]">
        <div className="flex gap-x-4">
          <ZoomOut>
            {(props: RenderZoomOutProps) => (
              <button onClick={props.onClick}>
                <ZoomOutIcon />
              </button>
            )}
          </ZoomOut>
          <CurrentScale>
            {(props: RenderCurrentScaleProps) => (
              <>{`${Math.round(props.scale * 100)}%`}</>
            )}
          </CurrentScale>

          <ZoomIn>
            {(props: RenderZoomInProps) => (
              <button onClick={props.onClick}>
                <ZoomInIcon />
              </button>
            )}
          </ZoomIn>
        </div>
        <div className="flex gap-5">
          <div className="hidden gap-x-4 md:flex md:items-center">
            <getFilePluginInstance.Download>
              {(props) => (
                <button className="" onClick={() => props.onClick()}>
                  <Download />
                </button>
              )}
            </getFilePluginInstance.Download>
            <EnterFullScreen>
              {(props: RenderEnterFullScreenProps) => (
                <button onClick={() => props.onClick()}>
                  <Maximize />
                </button>
              )}
            </EnterFullScreen>
          </div>
          <div className="flex gap-4">
            <Link className=" md:hidden" href={url}>
              <Download />
            </Link>

            <Dialog>
              <DialogTrigger>
                <FaShare></FaShare>
              </DialogTrigger>
              <DialogContent className="max-w-96 ">
                <DialogHeader>
                  <DialogTitle>Share Papers with your friends!</DialogTitle>
                  <DialogDescription>
                    Either scan the QR or copy the link and share
                  </DialogDescription>
                </DialogHeader>
                <div className="flex flex-col items-center justify-center gap-5  ">
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
          </div>
        </div>
      </div>
      <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.4.120/build/pdf.worker.min.js">
        <div className="border-1 w-[95%] overflow-x-hidden md:w-[80%]">
          <Viewer
            fileUrl={url}
            plugins={[
              zoomPluginInstance,
              getFilePluginInstance,
              fullScreenPluginInstance,
            ]}
          />
        </div>
      </Worker>
    </div>
  );
}
