"use client";

import { createContext, useContext, ReactNode } from "react";

interface PaperContextType {
  paperId: string;
  subject?: string;
  exam?: string;
  slot?: string;
  year?: string;
}

const PaperContext = createContext<PaperContextType | undefined>(undefined);

export const PaperProvider = ({ children, value }: { children: ReactNode; value: PaperContextType }) => {
  return <PaperContext.Provider value={value}>{children}</PaperContext.Provider>;
};

export const usePaper = () => {
  const context = useContext(PaperContext);
  if (!context) throw new Error("usePaper must be used within PaperProvider");
  return context;
};
