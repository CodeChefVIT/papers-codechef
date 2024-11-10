"use client";
import { type Paper, type Filters } from "@/interface";
import { FilterDialog } from "@/components/FilterDialog";
import Card from "./Card";
import { extractBracketContent } from "@/util/utils";
import { useRouter } from "next/navigation";
import SearchBar from "./searchbar";
import Loader from "./ui/loader";
import { useState } from "react";
import { Button } from "@/components/ui/button";

interface CatalogueContentProps {
  papers: Paper[];
  filterOptions?: Filters;
  exams?: string[];
  slots?: string[];
  years?: string[];
  subject?: string;
  error?: string | null;
}

export default function CatalogueContent({
  papers,
  filterOptions,
  exams,
  slots,
  years,
  subject,
  error
}: CatalogueContentProps) {
  const router = useRouter();
  const [selectedPapers, setSelectedPapers] = useState<Paper[]>([]);

  const handleResetFilters = () => {
    router.push(`/catalogue?subject=${encodeURIComponent(subject!)}`);
  };

  const handleSelectAll = () => setSelectedPapers(papers);
  const handleDeselectAll = () => setSelectedPapers([]);

  const handleDownloadAll = async () => {
    for (const paper of selectedPapers) {
      const extension = paper.finalUrl.split(".").pop();
      const fileName = `${extractBracketContent(paper.subject)}-${paper.exam}-${paper.slot}-${paper.year}.${extension}`;
      try {
        const response = await fetch(paper.finalUrl);
        const blob = await response.blob();
        const link = document.createElement("a");
        link.href = window.URL.createObjectURL(blob);
        link.download = fileName;
        link.click();
        window.URL.revokeObjectURL(link.href);
      } catch (error) {
        console.error('Error downloading file:', error);
      }
    }
  };

  const handleSelectPaper = (paper: Paper, isSelected: boolean) => {
    if (isSelected) {
      setSelectedPapers((prev) => [...prev, paper]);
    } else {
      setSelectedPapers((prev) => prev.filter((p) => p._id !== paper._id));
    }
  };

  const handleApplyFilters = (
    newExams: string[],
    newSlots: string[],
    newYears: string[],
  ) => {
    if (subject) {
      let pushContent = "/catalogue";
      pushContent = pushContent.concat(`?subject=${encodeURIComponent(subject)}`);
      
      if (newExams?.length > 0) {
        pushContent = pushContent.concat(`&exams=${encodeURIComponent(newExams.join(","))}`);
      }
      if (newSlots?.length > 0) {
        pushContent = pushContent.concat(`&slots=${encodeURIComponent(newSlots.join(","))}`);
      }
      if (newYears?.length > 0) {
        pushContent = pushContent.concat(`&years=${encodeURIComponent(newYears.join(","))}`);
      }
      
      router.push(pushContent);
    }
    handleDeselectAll();
  };

  if (!subject) {
    return <div>Please select a subject</div>;
  }

  return (
    <div className="min-h-screen px-2 md:p-8">
      <div className="mb-10 flex w-full flex-row items-center md:justify-between md:gap-10">
        <div className="w-[120%] md:w-[576px]">
          <SearchBar />
        </div>
        <div className="flex gap-8">
          {subject && filterOptions && (
            <FilterDialog
              subject={subject}
              filterOptions={filterOptions}
              initialExams={exams}
              initialSlots={slots}
              initialYears={years}
              onReset={handleResetFilters}
              onApplyFilters={handleApplyFilters}
            />
          )}
          <div className="hidden items-center justify-center gap-2 md:flex md:justify-end 2xl:mr-4">
            <Button variant="outline" onClick={handleSelectAll}>
              Select All
            </Button>
            <Button variant="outline" onClick={handleDeselectAll}>
              Deselect All
            </Button>
            <Button
              variant="outline"
              onClick={handleDownloadAll}
              disabled={selectedPapers.length === 0}
            >
              Download All ({selectedPapers.length})
            </Button>
          </div>
        </div>
      </div>

      {error && <p className="text-red-500">{error}</p>}
      {!papers.length ? (
        <Loader />
      ) : (
        <div className="mx-auto flex flex-col flex-wrap items-center justify-center gap-10 md:flex-row md:justify-normal">
          {papers.map((paper) => (
            <Card
              key={paper._id}
              paper={paper}
              onSelect={(p, isSelected) => handleSelectPaper(p, isSelected)}
              isSelected={selectedPapers.some((p) => p._id === paper._id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}