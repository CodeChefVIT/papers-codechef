"use client";

import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";
import { useState, useRef, useCallback, useEffect } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import { Download, ZoomIn, ZoomOut, Maximize2, Minimize2 } from "lucide-react";
import { Button } from "./ui/button";
import { downloadFile } from "../lib/utils/download";
import ShareButton from "./ShareButton";
import Loader from "./ui/loader";
import { FaGreaterThan, FaLessThan } from "react-icons/fa6";

pdfjs.GlobalWorkerOptions.workerSrc = 
  "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.8.69/pdf.worker.min.mjs";

interface PdfViewerProps {
  url: string;
  name: string;
}

export default function PdfViewer({ url, name }: PdfViewerProps) {
  const [numPages, setNumPages] = useState<number>();
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [scale, setScale] = useState<number>(1);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [inputValue, setInputValue] = useState(pageNumber.toString());
  const pageRefs = useRef<(HTMLDivElement | null)[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  function onDocumentLoadSuccess({ numPages }: { numPages: number }): void {
    setNumPages(numPages);
    setPageNumber(1);
    pageRefs.current = Array(numPages).fill(null) as (HTMLDivElement | null)[];
  }

  const scrollToPage = useCallback((page: number) => {
    if (pageRefs.current[page - 1] && containerRef.current) {
      const pageElement = pageRefs.current[page - 1];
      const container = containerRef.current;
      if (pageElement) {
        const offset = pageElement.offsetTop - container.offsetTop;
        container.scrollTo({ top: offset, behavior: "smooth" });
        setPageNumber(page);
      }
    }
  }, []);

  const handleScroll = useCallback(() => {
    if (!containerRef.current || !pageRefs.current) return;
    const container = containerRef.current;
    const scrollTop = container.scrollTop + container.offsetTop;

    for (let i = 0; i < pageRefs.current.length; i++) {
      const pageEl = pageRefs.current[i];
      if (pageEl) {
        const pageTop = pageEl.offsetTop;
        const pageBottom = pageTop + pageEl.offsetHeight;
        if (scrollTop >= pageTop && scrollTop < pageBottom) {
          setPageNumber(i + 1);
          break;
        }
      }
    }
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (container) {
      container.addEventListener("scroll", handleScroll);
      return () => container.removeEventListener("scroll", handleScroll);
    }
  }, [handleScroll]);

  const goToPreviousPage = () => {
    setPageNumber((prev) => {
      const newPage = Math.max(1, prev - 1);
      scrollToPage(newPage);
      return newPage;
    });
  };

  const goToNextPage = () => {
    setPageNumber((prev) => {
      const newPage = Math.min(numPages ?? 1, prev + 1);
      scrollToPage(newPage);
      return newPage;
    });
  };

  const handlePageChange = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      const target = e.target as HTMLInputElement;
      if (/^\d+$/.test(inputValue)) {
        const value = parseInt(inputValue, 10);
        if (value >= 1 && value <= (numPages ?? 1)) {
          setPageNumber(value);
          scrollToPage(value);
        } else {
          setInputValue(pageNumber.toString());
        }
      } else {
        setInputValue(pageNumber.toString());
      }
      target.blur();
    }
  };

  const zoomIn = () => {
    setScale((prev) => Math.min(prev + 0.25, 3));
  };

  const zoomOut = () => {
    setScale((prev) => Math.max(prev - 0.25, 0.25));
  };

  const downloadPDF = async () => {
    const fileName = `${name}.pdf`;
    await downloadFile(url, fileName);
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;

    if (!document.fullscreenElement) {
      containerRef.current
        .requestFullscreen()
        .then(() => {
          setIsFullscreen(true);
        })
        .catch((err) => {
          console.error("Error entering fullscreen:", err);
        });
    } else {
      document
        .exitFullscreen()
        .then(() => {
          setIsFullscreen(false);
        })
        .catch((err) => {
          console.error("Error exiting fullscreen:", err);
        });
    }
  };

  useEffect(() => {
    setInputValue(pageNumber.toString());
  }, [pageNumber]);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, []);

  useEffect(() => {
    if (containerRef.current) {
      const containerWidth = containerRef.current.offsetWidth;

      const initialScale = containerWidth / 800;
      setScale(initialScale > 1 ? 1 : initialScale);
    }
  }, []);

  useEffect(() => {
    const calculateScale = () => {
      if (containerRef.current) {
        const containerWidth = containerRef.current.offsetWidth;
        const initialScale = containerWidth / 800;
        setScale(initialScale > 1 ? 1 : initialScale);
      }
    };

    calculateScale();
    window.addEventListener("resize", calculateScale);
    return () => window.removeEventListener("resize", calculateScale);
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleWheel = (e: WheelEvent) => {
      if (e.ctrlKey) {
        e.preventDefault();
        const step = 0.02;
        setScale((prev) =>
          Math.max(0.25, Math.min(3, prev + (e.deltaY < 0 ? step : -step))),
        );
      }
    };

    container.addEventListener("wheel", handleWheel, { passive: false });
    return () => container.removeEventListener("wheel", handleWheel);
  }, []);

  return (
    <div className="flex flex-col items-center p-3 md:p-0">
      <div
        ref={containerRef}
        className="max-h-[70vh] w-full overflow-auto bg-[#F3F5FF] px-4 shadow-lg dark:bg-[#070114]"
      >
        <Document
          file={url}
          className={"w-fit"}
          onLoadSuccess={onDocumentLoadSuccess}
          error={
            <div className="p-4 text-red-500">Failed to load PDF file.</div>
          }
          loading={
            <div className="p-4 text-gray-500">
              <Loader />
            </div>
          }
          noData={
            <div className="p-4 text-gray-500">No PDF file specified.</div>
          }
        >
          {numPages &&
            Array.from({ length: numPages }, (_, index) => (
              <div
                key={`page_${index + 1}`}
                className="mb-4 w-full overflow-x-auto"
                ref={(el) => {
                  pageRefs.current[index] = el;
                }}
              >
                <div className="mx-auto flex w-fit justify-center">
                  <Page
                    pageNumber={index + 1}
                    scale={scale}
                    renderAnnotationLayer
                    renderTextLayer
                    className="shadow-md"
                  />
                </div>
              </div>
            ))}
        </Document>
        {isFullscreen && (
          <div className="fixed bottom-4 left-1/2 z-50 mt-4 flex -translate-x-1/2 flex-col items-center gap-4 rounded-lg bg-[#F3F5FF] p-4 shadow dark:bg-[#262635] sm:flex-row">
            <div className="flex items-center gap-2">
              <Button
                onClick={goToPreviousPage}
                disabled={pageNumber <= 1}
                className="h-10 w-10 rounded p-0 text-white transition hover:bg-[#6536c1] disabled:bg-[#706b7a] disabled:opacity-50"
              >
                <FaLessThan />
              </Button>
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => handlePageChange(e)}
                onFocus={() => setInputValue("")}
                className="h-10 w-16 rounded border p-1 text-center [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
              />
              <span>of {numPages ?? 1}</span>
              <Button
                onClick={goToNextPage}
                disabled={pageNumber >= (numPages ?? 1)}
                className="h-10 w-10 rounded p-0 text-white transition hover:bg-[#6536c1] disabled:bg-[#706b7a] disabled:opacity-50"
              >
                <FaGreaterThan />
              </Button>
            </div>

            <div className="flex items-center gap-2">
              <Button
                onClick={zoomOut}
                disabled={scale <= 0.25}
                className="h-10 w-10 rounded p-0 text-white transition hover:bg-[#6536c1] disabled:bg-gray-300"
              >
                <ZoomOut />
              </Button>
              <span>{(scale * 100).toFixed(0)}%</span>
              <Button
                onClick={zoomIn}
                disabled={scale >= 3}
                className="h-10 w-10 rounded p-0 text-white transition hover:bg-[#6536c1] disabled:bg-gray-300"
              >
                <ZoomIn />
              </Button>
              <ShareButton />
              <Button
                onClick={downloadPDF}
                className="aspect-square h-10 w-10 p-0"
              >
                <Download />
              </Button>
              <Button
                onClick={toggleFullscreen}
                className="h-10 w-10 rounded p-0 text-white transition hover:bg-[#6536c1]"
              >
                {isFullscreen ? <Minimize2 /> : <Maximize2 />}
              </Button>
            </div>
          </div>
        )}
      </div>

      {!isFullscreen && (
        <div className="mt-4 flex flex-col items-center gap-4 rounded-lg bg-[#F3F5FF] p-4 shadow dark:bg-[#262635] sm:flex-row">
          <div className="flex items-center gap-2">
            <Button
              onClick={goToPreviousPage}
              disabled={pageNumber <= 1}
              className="h-10 w-10 rounded p-0 text-white transition hover:bg-[#6536c1] disabled:bg-[#706b7a] disabled:opacity-50"
            >
              <FaLessThan />
            </Button>
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => handlePageChange(e)}
              onFocus={() => setInputValue("")}
              className="h-10 w-16 rounded border p-1 text-center [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
            />
            <span>of {numPages ?? 1}</span>
            <Button
              onClick={goToNextPage}
              disabled={pageNumber >= (numPages ?? 1)}
              className="h-10 w-10 rounded p-0 text-white transition hover:bg-[#6536c1] disabled:bg-[#706b7a] disabled:opacity-50"
            >
              <FaGreaterThan />
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <Button
              onClick={zoomOut}
              disabled={scale <= 0.25}
              className="h-10 w-10 rounded p-0 text-white transition hover:bg-[#6536c1] disabled:bg-gray-300"
            >
              <ZoomOut />
            </Button>
            <span>{(scale * 100).toFixed(0)}%</span>
            <Button
              onClick={zoomIn}
              disabled={scale >= 3}
              className="h-10 w-10 rounded p-0 text-white transition hover:bg-[#6536c1] disabled:bg-gray-300"
            >
              <ZoomIn />
            </Button>
            <ShareButton />
            <Button
              onClick={downloadPDF}
              className="aspect-square h-10 w-10 p-0"
            >
              <Download />
            </Button>
            <Button
              onClick={toggleFullscreen}
              className="h-10 w-10 rounded p-0 text-white transition hover:bg-[#6536c1]"
            >
              {isFullscreen ? <Minimize2 /> : <Maximize2 />}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
