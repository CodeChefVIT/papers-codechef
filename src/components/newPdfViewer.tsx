"use client"
import { createPluginRegistration } from '@embedpdf/core';
import { EmbedPDF } from '@embedpdf/core/react';
import { usePdfiumEngine } from '@embedpdf/engines/react';

import { Download, ZoomIn, ZoomOut, Maximize2, Minimize2 } from "lucide-react";
import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Button } from "./ui/button";
import { downloadFile } from "../lib/utils/download";

import ShareButton from "./ShareButton";
import ReportButton from "./ReportButton";

import { Viewport, ViewportPluginPackage }               from '@embedpdf/plugin-viewport/react';
import { useScroll, Scroller, ScrollPluginPackage }      from '@embedpdf/plugin-scroll/react';
import { DocumentContent, DocumentManagerPluginPackage } from '@embedpdf/plugin-document-manager/react';
import { useZoom, ZoomPluginPackage, ZoomMode }          from '@embedpdf/plugin-zoom/react';
import { RenderLayer, RenderPluginPackage }              from '@embedpdf/plugin-render/react';
import { ExportPluginPackage }                           from '@embedpdf/plugin-export/react';

interface ControlProps {
  documentId: string;
  toggleFullscreen: () => void;
  isFullscreen: boolean;
  onDownload: () => Promise<void>;
}

interface PdfViewerProps {
  url: string;
  name: string;
}

// memo — only re-renders when documentId / isFullscreen / onDownload / toggleFullscreen refs change.
// All function props must be stable (useCallback) in the parent for this to be effective.
const Controls = memo(function Controls({
  documentId,
  toggleFullscreen,
  isFullscreen,
  onDownload,
}: ControlProps) {
  const { provides: zoomProv, state: zoomState } = useZoom(documentId);
  const { provides: scrollProv, state: scrollState } = useScroll(documentId);
  const [pageNo, setPageNo] = useState("1");

  useEffect(() => {
    if (!scrollProv) return;
    // Subscribe to page changes and keep the input in sync.
    const unsub = scrollProv.onPageChange(() =>
      setPageNo(String(scrollProv.getCurrentPage()))
    );
    return () => unsub();
  }, [scrollProv]);

  // pageNo and totalPages are reactive values read inside the handler,
  // so they must be listed as deps to avoid a stale closure.
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

  return (
    <div
      style={{
        position: "absolute",
        ...(isFullscreen ? {
          bottom: 20,
          left: "50%",
          transform: "translateX(-50%)",
          flexDirection: "row",
        } : {
          top: "40%",
          right: 20,
          transform: "translateY(-50%)",
          flexDirection: "column",
        }),
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
      <Button
        onClick={toggleFullscreen}
        className="h-12 w-12 rounded p-0 text-white bg-[#6536c1] transition hover:bg-[#7d4fc7]"
      >
        {isFullscreen ? <Minimize2 size={24} /> : <Maximize2 size={24} />}
      </Button>

      <Button
        onClick={onDownload}
        className="h-12 w-12 rounded p-0 text-white bg-[#6536c1] transition hover:bg-[#7d4fc7]"
      >
        <Download size={24} />
      </Button>

      <ShareButton />

      <Button
        onClick={zoomOut}
        disabled={typeof zoomLevel === "number" && zoomLevel <= 0.25}
        className="h-12 w-12 rounded p-0 text-white bg-[#6536c1] transition hover:bg-[#7d4fc7] disabled:bg-gray-400"
      >
        <ZoomOut size={24} />
      </Button>

      <span className="text-xs text-[16px] py-2">
        {typeof zoomLevel === "number"
          ? `${Math.round(zoomLevel * 100)}%`
          : zoomLevel}
      </span>

      <Button
        onClick={zoomIn}
        disabled={typeof zoomLevel === "number" && zoomLevel >= 3}
        className="h-12 w-12 rounded p-0 text-white bg-[#6536c1] transition hover:bg-[#7d4fc7] disabled:bg-gray-400"
      >
        <ZoomIn size={24} />
      </Button>

      <div className={isFullscreen ? "flex flex-row items-center gap-2" : "flex flex-col items-center gap-2"}>
        <input
          type="text"
          value={pageNo}
          onChange={(e) => setPageNo(e.target.value)}
          onKeyDown={pageChange}
          onFocus={() => setPageNo("")}
          className="h-9 w-14 rounded border bg-[#e7e9ff] p-1 text-center text-sm [appearance:textfield] dark:bg-[#1f1f2a] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
        />
        <span className="text-xs font-medium">of {totalPages ?? 1}</span>
      </div>

      <ReportButton />
    </div>
  );
});

export default function PDFViewer({ url, name }: PdfViewerProps) {
  const { engine, isLoading } = usePdfiumEngine();
  const [isFullscreen, setIsFullscreen] = useState(false);
  const viewerRef = useRef<HTMLDivElement>(null);

  // Stable reference — only changes if url/name change (which should be never
  // during a viewer session). Avoids re-creating the fn on every PDFViewer render.
  const handleDownload = useCallback(async () => {
    window.dataLayer?.push({
      event: "pdf_download_start",
      paper_title: name,
      paper_url: url,
    });
    await downloadFile(url, `${name}.pdf`);
  }, [url, name]);

  // toggleFullscreen reads only from a ref and DOM APIs — no React state
  // is captured, so an empty dep array is correct and the reference never
  // needs to change, keeping memo(Controls) happy.
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

  // useMemo prevents the plugin array from being recreated on every render.
  // url is the only real dep — if the url changes, a fresh plugin set is correct.
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
    return <div>Loading PDF Engine...</div>;
  }

  return (
    <div
      ref={viewerRef}
      style={{ height: "100vh", width: "100%", position: "relative", backgroundColor: "#070114" }}
    >
      <EmbedPDF engine={engine} plugins={plugins}>
        {({ activeDocumentId }) =>
          activeDocumentId && (
            <>
              <DocumentContent documentId={activeDocumentId}>
                {({ isLoaded }) =>
                  isLoaded && (
                    <Viewport
                      documentId={activeDocumentId}
                      style={{ backgroundColor: "#070114" }}
                    >
                      <Scroller
                        documentId={activeDocumentId}
                        renderPage={({ width, height, pageIndex }) => (
                          <div style={{ width, height }}>
                            <RenderLayer
                              documentId={activeDocumentId}
                              pageIndex={pageIndex}
                            />
                          </div>
                        )}
                      />
                    </Viewport>
                  )
                }
              </DocumentContent>

              <Controls
                documentId={activeDocumentId}
                toggleFullscreen={toggleFullscreen}
                isFullscreen={isFullscreen}
                onDownload={handleDownload}
              />
            </>
          )
        }
      </EmbedPDF>
    </div>
  );
}