"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import axios, { type AxiosError } from "axios";
import { Button } from "@/components/ui/button";
import { type IPaper, type Filters, type StoredSubjects } from "@/interface";
import Card from "./Card";
import Loader from "./ui/loader";
import SideBar from "../components/SideBar";
import Error from "./Error";
import { Filter } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "./ui/sheet";
import { Pin } from "lucide-react";
import SearchBarChild from "./Searchbar/searchbar-child";
import Link from "next/link";
import { useCourses } from "@/context/courseContext";
import { FilterProvider, useFilters } from "@/context/filterContext";
import EmptyState from "./ui/EmptyState";
import SidebarButton from "./SidebarButton";
import SortComponent from "./ui/sorting";

const CatalogueContentInner = ({ subject }: { subject: string | null }) => {
  const [isMounted, setIsMounted] = useState(false);
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [pinned, setPinned] = useState<boolean>(false);
  const [relatedSubjects, setRelatedSubjects] = useState<string[]>([]);
  const { courses } = useCourses();
  const [sortOption, setSortOption] = useState<"asc" | "desc" | "none">("none");

  // Use filter context
  const {
    selectedExams,
    selectedSlots,
    selectedYears,
    selectedSemesters,
    selectedCampuses,
    selectedAnswerKeyIncluded,
    papers,
    appliedFilters,
    filtersPulled,
    currentPage,
    paginatedPapers,
    totalPages,
    selectedPapers,
    setPapers,
    setFilterOptions,
    setSelectedExams,
    setSelectedSlots,
    setSelectedYears,
    setSelectedSemesters,
    setSelectedCampuses,
    setSelectedAnswerKeyIncluded,
    setAppliedFilters,
    setCurrentPage,
    setFilteredPapers,
    handleSelectPaper,
    handleSelectAll,
    handleDeselectAll,
    handleDownloadSelected,
  } = useFilters();

  useEffect(() => {
    setCurrentPage(1);
  }, [subject]);

  // Fetch related subjects when subject changes
  useEffect(() => {
    if (!subject) return;
    const fetchRelatedSubjects = async () => {
      try {
        const res = await axios.get<{ related_subjects: string[] }>(
          "/api/related-subject",
          {
            params: { subject },
          },
        );
        const data = res.data.related_subjects;
        if (data && data.length > 0) {
          setRelatedSubjects(data);
        } else {
          setRelatedSubjects([]);
        }
      } catch {
        setRelatedSubjects([]);
      }
    };
    void fetchRelatedSubjects();
  }, [subject]);

  // Set initial state from searchParams on client-side mount
  useEffect(() => {
    setIsMounted(true);
    if (searchParams) {
      const currentPinnedSubjects = JSON.parse(
        localStorage.getItem("userSubjects") ?? "[]",
      ) as StoredSubjects;
      const subjectName = searchParams.get("subject");
      setSelectedExams(
        searchParams.get("exams")?.split(",").filter(Boolean) ?? [],
      );
      setSelectedSlots(
        searchParams.get("slots")?.split(",").filter(Boolean) ?? [],
      );
      setSelectedYears(
        searchParams.get("years")?.split(",").filter(Boolean) ?? [],
      );
      setSelectedCampuses(
        searchParams.get("campus")?.split(",").filter(Boolean) ?? [],
      );
      setSelectedSemesters(
        searchParams.get("semester")?.split(",").filter(Boolean) ?? [],
      );
      setSelectedAnswerKeyIncluded(searchParams.get("answerkey") === "true");
      if (subjectName && Array.isArray(currentPinnedSubjects)) {
        if (currentPinnedSubjects.includes(subjectName)) {
          setPinned(true);
        } else {
          setPinned(false);
        }
      }
    }
  }, [
    searchParams,
    setSelectedExams,
    setSelectedSlots,
    setSelectedYears,
    setSelectedSemesters,
    setSelectedCampuses,
    setSelectedAnswerKeyIncluded,
  ]);

  const handlePinToggle = () => {
    const current = !pinned;
    setPinned(current);

    const saved = JSON.parse(
      localStorage.getItem("userSubjects") ?? "[]",
    ) as string[];
    const updated = current
      ? [...new Set([...saved, subject])]
      : saved.filter((s) => s !== subject);

    localStorage.setItem("userSubjects", JSON.stringify(updated));
  };

  // Fetch papers ONLY when subject changes (not when filters change!)
  useEffect(() => {
    if (!subject || !isMounted) return;

    const fetchPapers = async () => {
      setLoading(true);
      try {
        const papersResponse = await axios.get<Filters>("/api/papers", {
          params: { subject },
        });
        const data: Filters = papersResponse.data;
        const papersData = data.papers;
        setFilterOptions(data);
        setPapers(papersData);
      } catch (error) {
        setPapers([]);
        const axiosError = error as AxiosError;
        setError(
          axios.isAxiosError(axiosError)
            ? ((axiosError.response?.data as { message?: string })?.message ??
                "Error fetching papers")
            : "Error fetching papers",
        );
      } finally {
        setLoading(false);
      }
    };

    void fetchPapers();
  }, [subject, isMounted, setPapers, setFilterOptions]);

  useEffect(() => {
    if (!papers.length) return;

    const filtered = [...papers];

    if (sortOption === "asc") {
      filtered.sort((a, b) => a.year.localeCompare(b.year));
    } else if (sortOption === "desc") {
      filtered.sort((a, b) => b.year.localeCompare(a.year));
    }

    setFilteredPapers(filtered);
  }, [
    papers,
    selectedExams,
    selectedSlots,
    selectedYears,
    selectedSemesters,
    selectedCampuses,
    selectedAnswerKeyIncluded,
    sortOption,
    setFilteredPapers,
    setAppliedFilters,
  ]);

  useEffect(() => {
    if (!papers.length) return;

    const filtered = papers.filter((paper) => {
      const examCondition = selectedExams.length
        ? selectedExams.includes(paper.exam)
        : true;
      const slotCondition = selectedSlots.length
        ? selectedSlots.includes(paper.slot)
        : true;
      const yearCondition = selectedYears.length
        ? selectedYears.includes(paper.year)
        : true;
      const semesterCondition = selectedSemesters.length
        ? selectedSemesters.includes(paper.semester)
        : true;
      const campusCondition = selectedCampuses.length
        ? selectedCampuses.includes(paper.campus)
        : true;
      const answerkeyCondition = selectedAnswerKeyIncluded
        ? paper.answer_key_included === true
        : true;
      return (
        examCondition &&
        slotCondition &&
        yearCondition &&
        semesterCondition &&
        campusCondition &&
        answerkeyCondition
      );
    });
    if (sortOption === "asc") {
      filtered.sort((a, b) => a.year.localeCompare(b.year));
    } else if (sortOption === "desc") {
      filtered.sort((a, b) => b.year.localeCompare(a.year));
    }
    setFilteredPapers(filtered);
    setAppliedFilters(
      selectedExams.length > 0 ||
        selectedSlots.length > 0 ||
        selectedYears.length > 0 ||
        selectedSemesters.length > 0 ||
        selectedCampuses.length > 0 ||
        selectedAnswerKeyIncluded,
    );
  }, [
    papers,
    selectedExams,
    selectedSlots,
    selectedYears,
    selectedSemesters,
    selectedCampuses,
    selectedAnswerKeyIncluded,
    setFilteredPapers,
    setAppliedFilters,
  ]);

  // Render loading state until mounted to avoid hydration mismatch
  if (!isMounted) {
    return <Loader />;
  }

  return (
    <div className="relative flex min-h-screen justify-center p-0 md:justify-normal">
      {papers.length > 0 && (
        <div className="hidden !w-[22%] min-w-[22%] max-w-[22%] flex-shrink-0 md:block">
          <SideBar />
        </div>
      )}

      <div className="w-full">
        {papers.length > 0 && (
          <Sheet>
            <SheetTrigger className="mx-8 mt-8 block md:hidden">
              <Button
                variant="outline"
                className="flex gap-2 border-2 border-black font-sans font-semibold hover:bg-slate-800 hover:text-white dark:border-[#434dba] dark:hover:border-white dark:hover:bg-slate-900"
              >
                <Filter size={18} />
                Add Filters
              </Button>
            </SheetTrigger>
            <SheetContent
              side={"left"}
              className="m-0 bg-[#f3f5ff] p-0 pt-4 dark:bg-[#070114]"
            >
              <SideBar />
            </SheetContent>
          </Sheet>
        )}

        <div className="flex flex-col items-start p-7">
          <div className="mb-8 flex w-full flex-col items-start md:hidden">
            <SearchBarChild initialSubjects={courses} />
          </div>
          <div className="flex items-center gap-2">
            <div>
              <p className="text-s font-semibold text-gray-700 dark:text-white/80">
                {subject?.split("[")[1]?.replace("]", "")}
              </p>
              <h2 className="text-2xl font-extrabold text-gray-700 dark:text-white md:text-3xl">
                {subject?.split(" [")[0]}
              </h2>
            </div>
            <div className="mt-7">
              <button onClick={handlePinToggle}>
                <Pin
                  className={`h-7 w-7 ${pinned ? "fill-[#A78BFA]" : ""} stroke-gray-700 dark:stroke-white`}
                />
              </button>
            </div>
          </div>

          {/* Select/Deselect/Download All Buttons */}
          <div className="mb-6 mt-5 flex w-full flex-wrap items-center justify-start gap-3 sm:gap-4 md:mt-4 md:justify-end">
            <SortComponent
              onSortChange={setSortOption}
              currentSort={sortOption}
            />

            <SidebarButton onClick={handleSelectAll} className="order-2">
              Select All
            </SidebarButton>

            <SidebarButton onClick={handleDeselectAll} className="order-2">
              Deselect All
            </SidebarButton>

            <SidebarButton onClick={handleDownloadSelected} className="order-2">
              Download Selected
            </SidebarButton>
          </div>

          {relatedSubjects.length > 0 && (
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <span className="mr-2 text-sm font-medium text-gray-500 dark:text-gray-300">
                Related subjects:
              </span>
              {relatedSubjects.map((sub) => (
                <Link
                  key={sub}
                  href={`/catalogue?subject=${encodeURIComponent(sub)}`}
                  className="rounded-full bg-violet-100 px-3 py-1 text-sm font-semibold text-violet-700 transition-colors hover:bg-violet-200 dark:bg-violet-900 dark:text-violet-200 dark:hover:bg-violet-800"
                >
                  {sub}
                </Link>
              ))}
            </div>
          )}
        </div>

        {loading ? (
          <Loader />
        ) : papers.length > 0 ? (
          <div className="flex flex-col items-center">
            <div
              className={`grid h-fit grid-cols-1 gap-8 px-[30px] pb-[40px] md:grid-cols-2 lg:grid-cols-4 ${filtersPulled ? "blur-xl" : ""}`}
            >
              {appliedFilters ? (
                paginatedPapers.length > 0 ? (
                  paginatedPapers.map((paper: IPaper) => (
                    <Card
                      key={paper._id}
                      paper={paper}
                      onSelect={handleSelectPaper}
                      isSelected={selectedPapers.some(
                        (p) => p._id === paper._id,
                      )}
                    />
                  ))
                ) : (
                  <div className="col-span-full flex justify-center">
                    <EmptyState />
                  </div>
                )
              ) : (
                paginatedPapers.map((paper: IPaper) => (
                  <Card
                    key={paper._id}
                    paper={paper}
                    onSelect={handleSelectPaper}
                    isSelected={selectedPapers.some((p) => p._id === paper._id)}
                  />
                ))
              )}
            </div>
            {totalPages > 1 && (
              <div className="mt-8 flex items-center justify-center gap-4">
                <Button
                  variant="outline"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(currentPage - 1)}
                >
                  Previous
                </Button>

                <span className="text-gray-700 dark:text-gray-300">
                  Page {currentPage} of {totalPages}
                </span>

                <Button
                  variant="outline"
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(currentPage + 1)}
                >
                  Next
                </Button>
              </div>
            )}
          </div>
        ) : (
          <Error
            filtersPulled={filtersPulled}
            message={error ?? "No papers available for this subject."}
          />
        )}
      </div>
    </div>
  );
};

const CatalogueContent = () => {
  const searchParams = useSearchParams();
  const [subject, setSubject] = useState<string | null>(null);

  useEffect(() => {
    if (searchParams) {
      const subjectName = searchParams.get("subject");
      setSubject(subjectName);
    }
  }, [searchParams]);

  return (
    <FilterProvider subject={subject}>
      <CatalogueContentInner subject={subject} />
    </FilterProvider>
  );
};

export default CatalogueContent;
