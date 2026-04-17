"use client"
import { createPluginRegistration } from '@embedpdf/core';
import { EmbedPDF }                 from '@embedpdf/core/react';
import { usePdfiumEngine }          from '@embedpdf/engines/react';
import { Viewport, ViewportPluginPackage }               from '@embedpdf/plugin-viewport/react';
import { useScroll, Scroller, ScrollPluginPackage }      from '@embedpdf/plugin-scroll/react';
import { DocumentContent, DocumentManagerPluginPackage } from '@embedpdf/plugin-document-manager/react';
import { useZoom, ZoomPluginPackage, ZoomMode }          from '@embedpdf/plugin-zoom/react';
import { RenderLayer, RenderPluginPackage }              from '@embedpdf/plugin-render/react';
import { ExportPluginPackage }                           from '@embedpdf/plugin-export/react';

import { Download, ZoomIn, ZoomOut, Maximize2, Minimize2 } from "lucide-react";
import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { downloadFile } from "../lib/utils/download";
import { Button } from "./ui/button";
import ShareButton from "./ShareButton";
import ReportButton from "./ReportButton";

interface ControlProps {
  documentId: string;
  toggleFullscreen: () => void;
  isFullscreen: boolean;
  onDownload: () => Promise<void>;
  forceMobile?: boolean;
  isMobile: boolean;
  isSmall: boolean;
}

interface PdfViewerProps {
  url: string;
  name: string;
  className?: string;
  height?: string;
  hideControls?: boolean;
  backgroundColor?: string;
  hideScrollbar?: boolean;
}

interface WheelZoomProps {
  documentId: string;
  viewerRef: React.RefObject<HTMLDivElement>;
}

function useBreakpoint() {
  const [width, setWidth] = useState<number | null>(null);

  useEffect(() => {
    setWidth(window.innerWidth);
    const handler = () => setWidth(window.innerWidth);
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);
  
  return {isMobile: width !== null && width < 768, isSmall: width !== null && width < 640};
}

const Controls = memo(function Controls({documentId, toggleFullscreen, isFullscreen, onDownload,
  forceMobile, isMobile, isSmall}: ControlProps) {

  const { provides: zoomProv, state: zoomState } = useZoom(documentId);
  const { provides: scrollProv, state: scrollState } = useScroll(documentId);
  const [pageNo, setPageNo] = useState("1");

  useEffect(() => {
    if (!scrollProv) return;
    const unsub = scrollProv.onPageChange(() =>
      setPageNo(String(scrollProv.getCurrentPage()))
    );
    return () => unsub();
  }, [scrollProv]);

  const pageChange = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key !== "Enter") return;
      const page = parseInt(pageNo, 10);
      if (!isNaN(page) && page >= 1 && page <= (scrollState?.totalPages ?? 1)) {
        scrollProv?.scrollToPage({ pageNumber: page, behavior: "smooth" });
      }
    },
    [pageNo, scrollState?.totalPages, scrollProv]
  );

  if (!zoomProv || !scrollProv) return null;

  const zoomIn = () => zoomProv.zoomIn();
  const zoomOut = () => zoomProv.zoomOut();
  const { zoomLevel } = zoomState;
  const { totalPages } = scrollState;
  
  const fullScreenStyle = {
    bottom: 20,
    left: "50%",
    transform: "translateX(-50%)",
  }

  const pageInput = (
    <div className={(!isFullscreen && !isMobile) ? "flex flex-col items-center gap-2" : "flex flex-row items-center gap-2"}>
        <input
          type="text"
          value={pageNo}
          onChange={(e) => setPageNo(e.target.value)}
          onKeyDown={pageChange}
          onFocus={() => setPageNo("")}
          className="h-9 w-14 rounded border bg-[#e7e9ff] p-1 text-center text-sm [appearance:textfield] dark:bg-[#1f1f2a] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
        />
        <span className="text-xs font-medium text-white">of {totalPages ?? 1}</span>
    </div>
  )
  
  const toolSet = (
    <>
      <Button
      onClick={toggleFullscreen}
      className="h-10 w-10 rounded p-0 text-white bg-[#6536c1] transition hover:bg-[#7d4fc7]"
      >
      {isFullscreen ? <Minimize2 size={24} /> : <Maximize2 size={24} />}
      </Button>

      <Button
        onClick={onDownload}
        className="h-10 w-10 rounded p-0 text-white bg-[#6536c1] transition hover:bg-[#7d4fc7]"
      >
        <Download size={24} />
      </Button>

      <ShareButton />

      <Button
        onClick={zoomOut}
        disabled={typeof zoomLevel === "number" && zoomLevel <= 0.25}
        className="h-10 w-10 rounded p-0 text-white bg-[#6536c1] transition hover:bg-[#7d4fc7] disabled:bg-gray-400"
      >
        <ZoomOut size={24} />
      </Button>

      <span className="text-xs text-[16.5px] py-2 text-white font-small bg-[#262635] rounded px-1">
        {typeof zoomLevel === "number" && `${Math.round(zoomLevel * 100)}%`}
      </span>

      <Button
        onClick={zoomIn}
        disabled={typeof zoomLevel === "number" && zoomLevel >= 3}
        className="h-10 w-10 rounded p-0 text-white bg-[#6536c1] transition hover:bg-[#7d4fc7] disabled:bg-gray-400"
      >
        <ZoomIn size={24} />
      </Button>

      {isSmall && <ReportButton/>}

    </>
  )

  if (!forceMobile) {
    return (
      <>
      {!isSmall ? 
        <div
          style={{
            position: "absolute",
            ...(isFullscreen ? {...fullScreenStyle, flexDirection: "row"} : {
              top: "40%",
              right: 20,
              transform: "translateY(-50%)",
              flexDirection: "column" as const,
            }),
            zIndex: 1,
            padding: "10px 8px",
            display: "flex",
            gap: 16,
            alignItems: "center",
            alignSelf: "center",
            width: isFullscreen ? "auto" : "96px",
            background: "#262635",
            borderRadius: 8,
            backdropFilter: "blur(6px)",
          }}
        >
          {toolSet}
          {pageInput}
          {!isSmall && <ReportButton />}
        </div> : 
        <div
          style={{
            position: "absolute",
            ...(isFullscreen ? fullScreenStyle : {
              top: "40%",
              right: 20,
              transform: "translateY(-50%)",
            }),
            flexDirection: "column" as const,
            zIndex: 1,
            padding: "20px 12px",
            display: "flex",
            gap: 16,
            alignItems: "center",
            alignSelf: "center",
            width: isFullscreen ? "auto" : "96px",
            background: "#262635",
            borderRadius: 8,
            backdropFilter: "blur(6px)",
          }}
        >       
          {pageInput}
          <div
            style={{
              display: "flex",
              flexDirection: isFullscreen ? "row" as const : "column" as const,
              gap: 16,
              alignItems: "center",
            }}
          >
            {toolSet}
          </div>
          
        </div>}
      </>
      
    );
  }

  return(
    <div
      style={{
        top: "40%",
        flexDirection: isSmall ? "column" : "row",
        zIndex: 1,
        padding: "10px 12px",
        display: "flex",
        gap: 16,
        alignItems: "center",
        alignSelf: "center",
        width: "auto",
        background: "#262635",
        borderRadius: 12,
        backdropFilter: "blur(6px)",
      }}
    > 
      {isSmall ? (
        <>
          {pageInput}
          <div style={{ display: "flex", flexDirection: "row", gap: 16, alignItems: "center" }}>
            {toolSet}
          </div>
        </>
      ) : (
        <>
          {toolSet}
          {pageInput}
          <ReportButton />
        </>
      )}
    </div>
  )
});

function WheelZoom({ documentId, viewerRef }: WheelZoomProps) {
  const { provides: zoomProv } = useZoom(documentId);
  const accumulatedDelta = useRef(0);
  const rafId = useRef<number | null>(null);
  const curZoom = useRef(1);

  useEffect(() => {
    if (!zoomProv) return;
    curZoom.current = zoomProv.getState().currentZoomLevel;
    const unsub = zoomProv.onZoomChange((e) => {
      curZoom.current = e.newZoom;
    });
    return unsub;
  }, [zoomProv]);

  const handleWheel = useCallback(
    (e: WheelEvent) => {
      if (!e.ctrlKey || !zoomProv) return;
      e.preventDefault();

      const isTrackpad = Math.abs(e.deltaY) < 50;
      const scaleFactor = isTrackpad ? 0.008 : 0.08;
      accumulatedDelta.current += -e.deltaY * scaleFactor;

      if (rafId.current !== null) cancelAnimationFrame(rafId.current);
      rafId.current = requestAnimationFrame(() => {
        const clamped = Math.max(-0.15, Math.min(accumulatedDelta.current, 0.15));

        if (isTrackpad) {
          const target = Math.max(0.25, Math.min(curZoom.current + clamped, 4));
          zoomProv.requestZoom(target)
          curZoom.current = target;
        } else {
          zoomProv.requestZoomBy(clamped);
        }

        accumulatedDelta.current = 0;
        rafId.current = null;
      });
    },
    [zoomProv]
  );

  useEffect(() => {
    const viewer = viewerRef.current;
    if (!viewer) return;
    viewer.addEventListener("wheel", handleWheel, { passive: false });
    return () => {
      viewer.removeEventListener("wheel", handleWheel);
      if (rafId.current !== null) cancelAnimationFrame(rafId.current);
    };
  }, [handleWheel]);

  return null;
}

function useLoadingMessage(messages: string[], interval = 2200) {
  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setIndex(i => (i + 1) % messages.length);
        setVisible(true);
      }, 400);
    }, interval);
    return () => clearInterval(timer);
  }, [messages, interval]);

  return { message: messages[index], visible };
}

const LOADING_MESSAGES = [
  "Loading document",
  "Preparing pages",
  "Almost there",
];

export function Loader() {
  const { message, visible } = useLoadingMessage(LOADING_MESSAGES);
  return (
    <div className="flex flex-col items-center justify-center gap-3 h-dvh w-full bg-[#070114]">
      <div className="w-7 h-7 rounded-full border-2 border-white/10 border-t-white animate-spin" />
      <span
        className="text-white/50 text-sm tracking-wide transition-opacity duration-400"
        style={{ opacity: visible ? 1 : 0 }}
      >
        {message}
      </span>
    </div>
  );
}
export default function PDFViewer({
  url,
  name,
  className,
  height = "100dvh",
  hideControls = false,
  backgroundColor = "#070114",
  hideScrollbar = false,
}: PdfViewerProps) {
  const { engine, isLoading } = usePdfiumEngine();
  const {isMobile, isSmall} = useBreakpoint();
  const [isFullscreen, setIsFullscreen] = useState(false);
  const viewerRef = useRef<HTMLDivElement>(null);

  const handleDownload = useCallback(async () => {
    window.dataLayer?.push({
      event: "pdf_download_start",
      paper_title: name,
      paper_url: url,
    });
    await downloadFile(url, `${name}.pdf`);
  }, [url, name]);

  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      void viewerRef.current?.requestFullscreen();
    } else {
      void document.exitFullscreen();
    }
  }, []);

  useEffect(() => {
    const handleFullscreenChange = () =>
      setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  const plugins = useMemo(() => [
    createPluginRegistration(DocumentManagerPluginPackage, {
      initialDocuments: [{ url }],
    }),
    createPluginRegistration(ViewportPluginPackage),
    createPluginRegistration(ScrollPluginPackage),
    createPluginRegistration(RenderPluginPackage),
    createPluginRegistration(ZoomPluginPackage, {
      defaultZoomLevel: ZoomMode.FitPage,
    }),
    createPluginRegistration(ExportPluginPackage, {
      defaultFileName: `${name}.pdf`,
    }),
  ], [url, name]);

if (isLoading || !engine) {
  return (
<Loader />
  );
}

  return (
    <>
      {hideScrollbar && (
        <style jsx global>{`
          [data-pdf-viewer-scrollbars="hidden"] *,
          [data-pdf-viewer-scrollbars="hidden"] {
            scrollbar-width: none;
            -ms-overflow-style: none;
          }

          [data-pdf-viewer-scrollbars="hidden"] ::-webkit-scrollbar {
            display: none;
            width: 0;
            height: 0;
          }
        `}</style>
      )}
      <div
        ref={viewerRef}
        data-pdf-viewer-scrollbars={hideScrollbar ? "hidden" : "visible"}
        className={className}
        style={{ height, width: "100%", position: "relative", backgroundColor, display: "flex", flexDirection: "column" }}
      >
        <EmbedPDF engine={engine} plugins={plugins}>
        {({ activeDocumentId }) =>
          activeDocumentId && (
            <>
              <WheelZoom documentId={activeDocumentId} viewerRef={viewerRef} />
              {!hideControls && (isMobile && !isFullscreen) && 
              <Controls
                documentId={activeDocumentId}
                toggleFullscreen={toggleFullscreen}
                isFullscreen={isFullscreen}
                onDownload={handleDownload}
                forceMobile={true}
                isMobile={isMobile}
                isSmall={isSmall}
              />}
              <DocumentContent documentId={activeDocumentId}>
            {({ isLoaded }) => (
              <>
                <div
            className="absolute inset-0 z-50 flex items-center justify-center bg-[#070114]"
            style={{
            opacity: isLoaded ? 0 : 1,
            pointerEvents: isLoaded ? "none" : "auto",
            transition: "opacity 0.3s",
            backgroundColor,
          }}
          >
            <Loader />
          </div>
      <Viewport
        documentId={activeDocumentId}
        style={{ backgroundColor, visibility: isLoaded ? "visible" : "hidden" }}
      >
        <Scroller
          documentId={activeDocumentId}
          renderPage={({ width, height, pageIndex }) => (
            <div
              style={{ width, height }}
              onClick={(e) => e.stopPropagation()}
            >
              <RenderLayer documentId={activeDocumentId} pageIndex={pageIndex} />
            </div>
          )}
        />
      </Viewport>
    </>
  )}
</DocumentContent>
              
              {!hideControls && (!isMobile || isFullscreen) && (
                <Controls
                  documentId={activeDocumentId}
                  toggleFullscreen={toggleFullscreen}
                  isFullscreen={isFullscreen}
                  onDownload={handleDownload}
                  forceMobile={false}
                  isMobile={isMobile}
                  isSmall={isSmall}
                />
              )}
            </>
          )
        }
        </EmbedPDF>
      </div>
    </>
  );
}
