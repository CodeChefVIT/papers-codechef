"use client";

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { type IPaper, type Filters } from "@/interface";
import JSZip from "jszip";
import { toast } from "react-hot-toast";
import { getSecureUrl, generateFileName } from "@/lib/utils/download";

interface FilterState {
  selectedExams: string[];
  selectedSlots: string[];
  selectedYears: string[];
  selectedSemesters: string[];
  selectedCampuses: string[];
  selectedAnswerKeyIncluded: boolean;

  papers: IPaper[];
  filteredPapers: IPaper[];
  selectedPapers: IPaper[];
  filterOptions: Filters | undefined;
  appliedFilters: boolean;

  filtersPulled: boolean;
  currentPage: number;
  papersPerPage: number;
}

interface FilterActions {
  setSelectedExams: (exams: string[]) => void;
  setSelectedSlots: (slots: string[]) => void;
  setSelectedYears: (years: string[]) => void;
  setSelectedSemesters: (semesters: string[]) => void;
  setSelectedCampuses: (campuses: string[]) => void;
  setSelectedAnswerKeyIncluded: (included: boolean) => void;

  setPapers: (papers: IPaper[]) => void;
  setFilteredPapers: (papers: IPaper[]) => void;
  setFilterOptions: (options: Filters | undefined) => void;

  setFiltersPulled: (pulled: boolean) => void;
  setAppliedFilters: (applied: boolean) => void;
  setCurrentPage: (page: number) => void;

  handleApplyFilters: (
    exams: string[],
    slots: string[],
    years: string[],
    campus: string[],
    semester: string[],
    anskey: boolean,
  ) => void;
  handleSelectPaper: (paper: IPaper, isSelected: boolean) => void;
  handleSelectAll: () => void;
  handleDeselectAll: () => void;
  handleDownloadSelected: () => Promise<void>;
  filtersNotPulled: () => void;
  noAppliedFilters: () => void;
  closeFilters: () => void;

  paginatedPapers: IPaper[];
  totalPages: number;
}

type FilterContextType = FilterState & FilterActions;

const FilterContext = createContext<FilterContextType | undefined>(undefined);

interface FilterProviderProps {
  children: ReactNode;
  subject: string | null;
}

export const FilterProvider: React.FC<FilterProviderProps> = ({
  children,
  subject,
}) => {
  const router = useRouter();

  const [selectedExams, setSelectedExams] = useState<string[]>([]);
  const [selectedSlots, setSelectedSlots] = useState<string[]>([]);
  const [selectedYears, setSelectedYears] = useState<string[]>([]);
  const [selectedSemesters, setSelectedSemesters] = useState<string[]>([]);
  const [selectedCampuses, setSelectedCampuses] = useState<string[]>([]);
  const [selectedAnswerKeyIncluded, setSelectedAnswerKeyIncluded] =
    useState<boolean>(false);

  const [papers, setPapers] = useState<IPaper[]>([]);
  const [filteredPapers, setFilteredPapers] = useState<IPaper[]>([]);
  const [selectedPapers, setSelectedPapers] = useState<IPaper[]>([]);
  const [filterOptions, setFilterOptions] = useState<Filters>();

  const [filtersPulled, setFiltersPulled] = useState<boolean>(false);
  const [appliedFilters, setAppliedFilters] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [papersPerPage] = useState(12);

  const filtersNotPulled = useCallback(() => {
    setFiltersPulled(false);
  }, []);

  const noAppliedFilters = useCallback(() => {
    setAppliedFilters(false);
  }, []);

  const closeFilters = useCallback(() => {
    setFiltersPulled(false);
  }, []);

  const handleSelectPaper = useCallback(
    (paper: IPaper, isSelected: boolean) => {
      setSelectedPapers((prev) =>
        isSelected ? [...prev, paper] : prev.filter((p) => p._id !== paper._id),
      );
    },
    [],
  );

  const handleSelectAll = useCallback(() => {
    const currentPapers = appliedFilters ? filteredPapers : papers;
    setSelectedPapers(currentPapers);
  }, [papers, filteredPapers, appliedFilters]);

  const handleDeselectAll = useCallback(() => {
    setSelectedPapers([]);
  }, []);

  const searchParams = useSearchParams();
  const handleDownloadSelected = useCallback(async () => {
    if (selectedPapers.length === 0) {
      toast.error("No papers selected for download.");
      return;
    }

    const zip = new JSZip();
    const uniquePapers = Array.from(
      new Set(selectedPapers.map((paper) => paper._id)),
    ).map((id) => selectedPapers.find((paper) => paper._id === id)) as IPaper[];

    for (const paper of uniquePapers) {
      try {
        console.log(paper);
        const response = await fetch(getSecureUrl(paper.file_url));
        const blob = await response.blob();
        const filename = generateFileName(paper);
        zip.file(filename, blob);
      } catch (err) {
        console.error(`Failed to fetch ${paper.file_url}`, err);
      }
    }

    const zipBlob = await zip.generateAsync({ type: "blob" });
    const url = URL.createObjectURL(zipBlob);
    const a = document.createElement("a");
    a.href = url;
    a.download = searchParams.get("subject")?.split(" [")[0] ?? "papers";
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    toast.success("Download Initiated");
  }, [selectedPapers]);

  const handleApplyFilters = useCallback(
    (
      exams: string[],
      slots: string[],
      years: string[],
      campus: string[],
      semester: string[],
      anskey: boolean,
    ) => {
      let pushContent = "/catalogue";
      if (subject) pushContent += `?subject=${encodeURIComponent(subject)}`;
      if (exams.length > 0)
        pushContent += `&exams=${encodeURIComponent(exams.join(","))}`;
      if (slots.length > 0)
        pushContent += `&slots=${encodeURIComponent(slots.join(","))}`;
      if (years.length > 0)
        pushContent += `&years=${encodeURIComponent(years.join(","))}`;
      if (campus.length > 0)
        pushContent += `&campus=${encodeURIComponent(campus.join(","))}`;
      if (semester.length > 0)
        pushContent += `&semester=${encodeURIComponent(semester.join(","))}`;
      if (anskey) pushContent += "&answerkey=true";

      router.replace(pushContent, { scroll: false });

      setSelectedExams(exams);
      setSelectedSlots(slots);
      setSelectedYears(years);
      setSelectedCampuses(campus);
      setSelectedSemesters(semester);
      setSelectedAnswerKeyIncluded(anskey);
      setCurrentPage(1);
    },
    [
      router,
      subject,
      setSelectedExams,
      setSelectedSlots,
      setSelectedYears,
      setSelectedCampuses,
      setSelectedSemesters,
      setSelectedAnswerKeyIncluded,
      setCurrentPage,
    ],
  );

  const paginatedPapers = filteredPapers.slice(
    (currentPage - 1) * papersPerPage,
    currentPage * papersPerPage,
  );

  const totalPages = Math.ceil(
    (appliedFilters ? filteredPapers.length : papers.length) / papersPerPage,
  );

  const value: FilterContextType = {
    selectedExams,
    selectedSlots,
    selectedYears,
    selectedSemesters,
    selectedCampuses,
    selectedAnswerKeyIncluded,
    papers,
    filteredPapers,
    selectedPapers,
    filterOptions,
    appliedFilters,
    filtersPulled,
    currentPage,
    papersPerPage,

    setSelectedExams,
    setSelectedSlots,
    setSelectedYears,
    setSelectedSemesters,
    setSelectedCampuses,
    setSelectedAnswerKeyIncluded,
    setPapers,
    setFilteredPapers,
    setFilterOptions,
    setFiltersPulled,
    setAppliedFilters,
    setCurrentPage,

    handleApplyFilters,
    handleSelectPaper,
    handleSelectAll,
    handleDeselectAll,
    handleDownloadSelected,
    filtersNotPulled,
    noAppliedFilters,
    closeFilters,

    paginatedPapers,
    totalPages,
  };

  return (
    <FilterContext.Provider value={value}>{children}</FilterContext.Provider>
  );
};

export const useFilters = (): FilterContextType => {
  const context = useContext(FilterContext);
  if (!context) {
    throw new Error("useFilters must be used within a FilterProvider");
  }
  return context;
};
