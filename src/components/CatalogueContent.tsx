"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import axios, { type AxiosError } from "axios";
import { Button } from "@/components/ui/button";
import { type IPaper, type Filters } from "@/interface";
import { FilterDialog } from "@/components/FilterDialog";
import Card from "./Card";
import { extractBracketContent } from "@/util/utils";
import { useRouter } from "next/navigation";
import SearchBarChild from "./Searchbar/searchbar-child";
import Loader from "./ui/loader";
import { campuses, semesters } from "./select_options";
import SearchBar from "./Searchbar/searchbar";
import filterIcon from "../assets/filterIcon.svg";
import Image from "next/image";
import { XIcon } from "lucide-react";
import  SideBar  from "../components/SideBar";

const CatalogueContent = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const subject = searchParams.get("subject");
  const exams = searchParams.get("exams")?.split(",");
  const slots = searchParams.get("slots")?.split(",");
  const years = searchParams.get("years")?.split(",");
  const semesters = searchParams.get("semesters")?.split(",");
  const campuses = searchParams.get("campuses")?.split(",");

  const [selectedExams, setSelectedExams] = useState<string[] | undefined>(
    exams,
  );
  const [selectedSlots, setSelectedSlots] = useState<string[] | undefined>(
    slots,
  );
  const [selectedYears, setSelectedYears] = useState<string[] | undefined>(
    years,
  );

  // const handleResetFilters = () => {
  //   setSelectedExams([]);
  //   setSelectedSlots([]);
  //   setSelectedYears([]);
  //   router.push(`/catalogue?subject=${encodeURIComponent(subject!)}`);
  // };

  const [papers, setPapers] = useState<IPaper[]>([]);
  const [selectedPapers, setSelectedPapers] = useState<IPaper[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [filterOptions, setFilterOptions] = useState<Filters>();

  const handleSelectAll = () => setSelectedPapers(papers);
  const handleDeselectAll = () => setSelectedPapers([]);

  const handleDownloadAll = async () => {
    for (const paper of selectedPapers) {
      const extension = paper.finalUrl.split(".").pop();
      const fileName = `${extractBracketContent(paper.subject)}-${paper.exam}-${paper.slot}-${paper.year}.${extension}`;
      await downloadFile(paper.finalUrl, fileName);
    }
  };

  async function downloadFile(url: string, filename: string) {
    try {
      const response = await axios.get(url, { responseType: "blob" });
      const blob = new Blob([response.data]);
      const link = document.createElement("a");
      link.href = window.URL.createObjectURL(blob);
      link.download = filename;
      link.click();
      window.URL.revokeObjectURL(link.href);
    } catch (error) {}
  }

  const handleSelectPaper = (paper: IPaper, isSelected: boolean) => {
    if (isSelected) {
      setSelectedPapers((prev) => [...prev, paper]);
    } else {
      setSelectedPapers((prev) => prev.filter((p) => p._id !== paper._id));
    }
  };
  const handleApplyFilters = (
    exams: string[],
    slots: string[],
    years: string[],
  ) => {
    if (subject) {
      let pushContent = "/catalogue";
      if (subject) {
        pushContent = pushContent.concat(
          `?subject=${encodeURIComponent(subject)}`,
        );
      }
      if (exams !== undefined && exams.length > 0) {
        console.log(exams)
        pushContent = pushContent.concat(
          `&exams=${encodeURIComponent(exams.join(","))}`,
        );
      }
      if (slots !== undefined && slots.length > 0) {
        pushContent = pushContent.concat(
          `&slots=${encodeURIComponent(slots.join(","))}`,
        );
      }
      if (years !== undefined && years.length > 0) {
        pushContent = pushContent.concat(
          `&years=${encodeURIComponent(years.join(","))}`,
        );
      }
      router.push(pushContent);
    }
    // setSelectedExams(exams);
    // setSelectedSlots(slots);
    // setSelectedYears(years);
    handleDeselectAll();
  };

  useEffect(() => {
    
    if (subject) {
      console.log("this madafaka useeffect")
      const fetchPapers = async () => {
        setLoading(true);

        try {
          const papersResponse = await axios.get<Filters>("/api/papers", {
            params: { subject },
          });
          const Data: Filters = papersResponse.data;
          const papersData = Data.papers;
          const filters: Filters = papersResponse.data;

          setFilterOptions(filters);

          const papersDataWithFilters = papersData.filter((paper) => {
            const examCondition = exams?.length
              ? exams.includes(paper.exam)
              : true;
            const slotCondition = slots?.length
              ? slots.includes(paper.slot)
              : true;
            const yearCondition = years?.length
              ? years.includes(paper.year)
              : true;

            return examCondition && slotCondition && yearCondition;
          });

          setPapers(
            papersDataWithFilters.length >= 0
              ? papersDataWithFilters
              : papersData,
          );
        } catch (error) {
          if (axios.isAxiosError(error)) {
            const axiosError = error as AxiosError<{ message?: string }>;
            setError(
              axiosError.response?.data?.message ?? "Error fetching papers",
            );
          } else {
            setError("Error fetching papers");
          }
        } finally {
          setLoading(false);
        }
      };

      void fetchPapers();
    }
  }, [subject, exams?.join(","), slots?.join(","), years?.join(",")]); //changed because userRouter() changes everytime 
  return (
    <div className="flex min-h-screen px-2 md:p-0 relative">
      <SideBar handleApplyFilters={handleApplyFilters} handleSelectAll={handleSelectAll} handleDeselectAll={handleDeselectAll} selectedPapers={selectedPapers} subject={subject} filterOptions={filterOptions}  handleDownloadAll={handleDownloadAll}/>

      {error && <p className="text-red-500">{error}</p>}
      {loading ? (
        <Loader />
      ) : papers.length > 0 ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 px-[30px] py-[40px]">
            {papers.map((paper) => (
              <Card
                key={paper._id}
                paper={paper}
                onSelect={(p, isSelected) => handleSelectPaper(p, isSelected)}
                isSelected={selectedPapers.some((p) => p._id === paper._id)}
              />
            ))}
          </div>
        </>
      ) : (
        <p>No papers available for this subject.</p>
      )}
    </div>
  );
};

export default CatalogueContent;
