"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import axios from "axios";
import { type ApiResponse } from "@/interface";
import { X, Download, Minus, Maximize2, Minimize2 } from "lucide-react";
import PDFViewer from "./newPdfViewer";

interface SyllabusDockProps {
  subject: string | null;
}

type DockState = "hidden" | "collapsed" | "expanded";

export default function SyllabusDock({ subject }: SyllabusDockProps) {
  const [syllabusUrl, setSyllabusUrl] = useState<string | null>(null);
  const [dockState, setDockState] = useState<DockState>("hidden");
  const [loading, setLoading] = useState(false);
  const [hasAnimated, setHasAnimated] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [position, setPosition] = useState({ right: -1, bottom: -1 });
  const [size, setSize] = useState({ width: 420, height: 600 });
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  
  const dockRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window !== "undefined" && position.right === -1) {
      const initialWidth = 420;
      const initialHeight = Math.min(600, window.innerHeight * 0.7);
      setSize({ width: initialWidth, height: initialHeight });
      setPosition({ right: 24, bottom: 24 });
    }
  }, [position.right]);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const fetchSyllabus = useCallback(async () => {
    if (!subject) {
      setDockState("hidden");
      setSyllabusUrl(null);
      return;
    }

    setLoading(true);
    try {
      const res = await axios.get<ApiResponse<{ syllabus: string | null }>>(
        "/api/syllabus",
        { params: { subject } }
      );
      const url = res.data.data?.syllabus;
      if (url) {
        setSyllabusUrl(url);
        const savedState = sessionStorage.getItem("syllabus-dock-state");
        setDockState(savedState === "expanded" ? "expanded" : "collapsed");
        setHasAnimated(false);
      } else {
        setSyllabusUrl(null);
        setDockState("collapsed");
      }
    } catch {
      setSyllabusUrl(null);
      setDockState("collapsed");
    } finally {
      setLoading(false);
    }
  }, [subject]);

  useEffect(() => {
    void fetchSyllabus();
  }, [fetchSyllabus]);

  useEffect(() => {
    if (dockState === "collapsed" && !hasAnimated) {
      const timer = setTimeout(() => setHasAnimated(true), 100);
      return () => clearTimeout(timer);
    }
  }, [dockState, hasAnimated]);

  const isDraggingRef = useRef(false);

  const handleMouseDownDrag = (e: React.MouseEvent) => {
    if (isFullscreen) return;
    
    const target = e.target as HTMLElement;
    if (target.closest("button")) {
       return;
    }

    e.preventDefault();
    setIsDragging(true);
    isDraggingRef.current = false;
    const startX = e.clientX;
    const startY = e.clientY;
    const startPosRight = position.right;
    const startPosBottom = position.bottom;
    
    let currentRight = startPosRight;
    let currentBottom = startPosBottom;

    const onMouseMove = (moveEvent: MouseEvent) => {
      const dx = moveEvent.clientX - startX;
      const dy = moveEvent.clientY - startY;
      if (Math.abs(dx) > 3 || Math.abs(dy) > 3) {
        isDraggingRef.current = true;
      }

      const newRight = startPosRight - dx;
      const newBottom = startPosBottom - dy;

      const currentWidth = dockState === "collapsed" ? (dockRef.current?.querySelector('.dock-pill')?.clientWidth ?? 160) : size.width;
      const currentHeight = dockState === "collapsed" ? (dockRef.current?.querySelector('.dock-pill')?.clientHeight ?? 48) : size.height;

      const maxRight = window.innerWidth - currentWidth;
      const maxBottom = window.innerHeight - currentHeight;
      
      currentRight = Math.max(0, Math.min(maxRight, newRight));
      currentBottom = Math.max(0, Math.min(maxBottom, newBottom));
      
      setPosition({ right: currentRight, bottom: currentBottom });
    };

    const onMouseUp = () => {
      setIsDragging(false);
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
    };

    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
  };

  const handleMouseDownResize = (e: React.MouseEvent) => {
    if (isFullscreen) return;
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true); 
    
    const startX = e.clientX;
    const startY = e.clientY;
    const startW = size.width;
    const startH = size.height;
    const startPosRight = position.right;
    const startPosBottom = position.bottom;

    const onMouseMove = (moveEvent: MouseEvent) => {
      const dx = moveEvent.clientX - startX;
      const dy = moveEvent.clientY - startY;

      const newWidth = Math.max(300, startW + dx);
      const newHeight = Math.max(200, startH + dy);

      setSize({
        width: newWidth,
        height: newHeight,
      });
      setPosition({
        right: startPosRight - (newWidth - startW),
        bottom: startPosBottom - (newHeight - startH)
      });
    };

    const onMouseUp = () => {
      setIsDragging(false);
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
    };

    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
  };

  const handlePillClick = () => {
    if (isDraggingRef.current) {
      isDraggingRef.current = false;
      return;
    }
    if (syllabusUrl) {
      setDockState("expanded");
      sessionStorage.setItem("syllabus-dock-state", "expanded");
      
      setPosition(prev => ({
        right: Math.max(0, Math.min(window.innerWidth - size.width, prev.right)),
        bottom: Math.max(0, Math.min(window.innerHeight - size.height, prev.bottom))
      }));
    }
  };

  const handleCollapse = () => {
    setDockState("collapsed");
    sessionStorage.setItem("syllabus-dock-state", "collapsed");
  };

  const handleClose = () => {
    setDockState("collapsed");
    sessionStorage.setItem("syllabus-dock-state", "collapsed");
    
    setPosition({ right: 24, bottom: 24 });
  };

  const subjectName = subject?.split(" [")[0] ?? "";
  const courseCode = subject?.split("[")[1]?.replace("]", "") ?? "";

  if (dockState === "hidden" || position.right === -1) return null;

  const getPositionStyle = () => {
    if (isMobile) return {};
    
    if (isFullscreen && dockState === "expanded") {
      return { left: 0, top: 0, width: "100vw", height: "100vh", borderRadius: 0 };
    }
    
    if (dockState === "collapsed") {
      return { 
        right: `${position.right}px`, 
        bottom: `${position.bottom}px` 
      };
    }
    
    return { 
      right: `${position.right}px`, 
      bottom: `${position.bottom}px`, 
      width: `${size.width}px`, 
      height: `${size.height}px` 
    };
  };

  if (dockState === "collapsed") {
    const pillStyle = isMobile ? { bottom: '24px', right: '24px' } : getPositionStyle();
    
    return (
      <div
        ref={dockRef}
        className={`dock-pill fixed z-[60] select-none ${hasAnimated ? "dock-pill-visible" : "dock-pill-enter"}`}
        style={pillStyle}
        onMouseDown={handleMouseDownDrag}
        onClick={handlePillClick}
      >
        <div className={`group relative flex h-10 items-center justify-center gap-2 rounded-full border-2 px-5 font-sans font-semibold shadow-lg backdrop-blur-xl transition-all duration-300 ${
          syllabusUrl 
            ? "border-black bg-white text-black hover:bg-slate-800 hover:text-white dark:border-[#434dba] dark:bg-[#070114] dark:text-white dark:hover:border-white dark:hover:bg-slate-900 cursor-move" 
            : "border-gray-400/40 bg-gray-200/90 text-gray-600 dark:border-gray-600/40 dark:bg-gray-800/90 dark:text-gray-400 cursor-move"
        }`}>
          <span 
            className={`transition-transform duration-300 group-hover:scale-105 whitespace-nowrap flex-shrink-0 ${syllabusUrl ? 'cursor-pointer' : ''}`}
          >
            {syllabusUrl ? "View Syllabus" : "No Syllabus"}
          </span>
          {syllabusUrl && <span className="h-1.5 w-1.5 rounded-full bg-[#734DFF] opacity-60 transition-opacity group-hover:opacity-100 flex-shrink-0" />}
        </div>
      </div>
    );
  }

  if (isMobile) {
    return (
      <div className="fixed inset-0 z-[60] flex flex-col bg-[#F3F5FF] dark:bg-[#0A0718]">
        <div className="flex items-center justify-between border-b border-[#734DFF]/20 bg-[#EAEEFF]/80 px-4 py-3 backdrop-blur-md dark:border-[#734DFF]/10 dark:bg-[#130E20]/80">
          <div className="min-w-0 flex-1">
            <p className="truncate font-play text-xs font-medium text-[#734DFF] dark:text-[#A78BFA]">
              {courseCode}
            </p>
            <p className="truncate font-play text-sm font-bold text-gray-800 dark:text-white">
              {subjectName}
            </p>
          </div>
          <div className="flex items-center gap-1">
            <a
              href={syllabusUrl!}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-lg p-2 text-gray-500 transition-colors hover:bg-[#734DFF]/10 hover:text-[#734DFF] dark:text-gray-400 dark:hover:text-[#A78BFA]"
            >
              <Download className="h-4 w-4" />
            </a>
            <button
              onClick={handleClose}
              className="rounded-lg p-2 text-gray-500 transition-colors hover:bg-red-500/10 hover:text-red-500 dark:text-gray-400"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-hidden relative">
          {loading ? (
            <div className="flex h-full items-center justify-center">
              <div className="dock-loader h-8 w-8 rounded-full border-2 border-[#734DFF]/20 border-t-[#734DFF]" />
            </div>
          ) : (
            <PDFViewer
              url={syllabusUrl!}
              name={subjectName}
              className="h-full w-full"
              hideControls={true}
            />
          )}
        </div>
      </div>
    );
  }

  return (
    <div
      ref={dockRef}
      className={`fixed z-[60] flex flex-col overflow-hidden border border-[#734DFF]/25 bg-[#F3F5FF]/95 shadow-2xl shadow-[#734DFF]/10 backdrop-blur-2xl transition-colors dark:border-[#734DFF]/15 dark:bg-[#0E0A1A]/95 dark:shadow-[#734DFF]/5 ${!isFullscreen ? "rounded-2xl" : ""}`}
      style={getPositionStyle()}
    >
      <div 
        className="dock-header flex items-center justify-between border-b border-[#734DFF]/15 bg-gradient-to-r from-[#EAEEFF]/80 to-[#E0E4FF]/60 px-4 py-3 dark:border-[#734DFF]/10 dark:from-[#15102A]/80 dark:to-[#1A1535]/60"
        onMouseDown={handleMouseDownDrag}
        style={{ cursor: isFullscreen ? "default" : "move" }}
      >
        <div className="min-w-0 flex-1 select-none pointer-events-none">
          <p className="truncate font-play text-[11px] font-semibold uppercase tracking-wider text-[#734DFF]/70 dark:text-[#A78BFA]/60">
            {courseCode}
          </p>
          <p className="truncate font-play text-sm font-bold text-gray-800 dark:text-white">
            {subjectName} — Syllabus
          </p>
        </div>
        <div className="flex items-center gap-0.5" onMouseDown={(e) => e.stopPropagation()}>
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-[#734DFF]/10 hover:text-[#734DFF] dark:text-gray-500 dark:hover:text-[#A78BFA]"
            title={isFullscreen ? "Restore Down" : "Maximize"}
          >
            {isFullscreen ? <Minimize2 className="h-3.5 w-3.5" /> : <Maximize2 className="h-3.5 w-3.5" />}
          </button>
          <button
            onClick={handleCollapse}
            className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-[#734DFF]/10 hover:text-[#734DFF] dark:text-gray-500 dark:hover:text-[#A78BFA]"
            title="Minimize"
          >
            <Minus className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={handleClose}
            className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-red-500/10 hover:text-red-500 dark:text-gray-500"
            title="Close"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-hidden relative">
        {loading ? (
          <div className="flex h-full items-center justify-center">
            <div className="dock-loader h-8 w-8 rounded-full border-2 border-[#734DFF]/20 border-t-[#734DFF]" />
          </div>
        ) : (
          <div className={`h-full w-full ${isDragging ? 'pointer-events-none' : ''}`}>
            <PDFViewer
              url={syllabusUrl!}
              name={subjectName}
              className="h-full w-full"
              hideControls={true}
            />
          </div>
        )}
      </div>

      <div className="flex items-center justify-between border-t border-[#734DFF]/10 bg-gradient-to-r from-[#EAEEFF]/50 to-transparent px-4 py-2 dark:border-[#734DFF]/5 dark:from-[#15102A]/50 select-none">
        <span className="font-play text-[10px] text-gray-400 dark:text-gray-600">
          Syllabus PDF
        </span>
        <button
          onClick={handleCollapse}
          className="font-play text-[10px] font-medium text-[#734DFF]/60 transition-colors hover:text-[#734DFF] dark:text-[#A78BFA]/40 dark:hover:text-[#A78BFA]"
        >
          Minimize
        </button>
      </div>

      {!isFullscreen && (
        <div
          className="absolute bottom-0 right-0 h-4 w-4 cursor-se-resize"
          onMouseDown={handleMouseDownResize}
        />
      )}
    </div>
  );
}
