"use client";

import React, { useEffect, useState } from "react";
import SearchBar from "./Searchbar/searchbar";
import { FilterDialog } from "./FilterDialog";
import { Button } from "./ui/button";
import Image from "next/image";
import { XIcon } from "lucide-react";
import filterIcon from "../assets/filterIcon.svg";
import { Filters, IPaper } from "@/interface";
import { useRouter } from "next/navigation";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

function SideBar({
  subject,
  filterOptions,
  handleSelectAll,
  handleDeselectAll,
  selectedPapers,
  handleDownloadAll,
  handleApplyFilters,
}: {
  subject: string | null;
  filterOptions: Filters | undefined;
  handleSelectAll: () => void;
  handleDeselectAll: () => void;
  selectedPapers: IPaper[];
  handleDownloadAll: () => void;
  handleApplyFilters: (
    exams: string[],
    slots: string[],
    years: string[],
  ) => void;
}) {
  const router = useRouter();

  const [selectedExams, setSelectedExams] = useState<string[]>([]);
  const [selectedSlots, setSelectedSlots] = useState<string[]>([]);
  const [selectedYears, setSelectedYears] = useState<string[]>([]);
  const [selectedCampuses, setSelectedCampuses] = useState<string[]>([]);
  const [selectedSemesters, setSelectedSemesters] = useState<string[]>([]);
  const [answerKey, setAnswerKey] = useState<boolean>(false);
  const exams = filterOptions?.uniqueExams.map((exam) => ({
    label: exam,
    value: exam,
  }));
  const slots = filterOptions?.uniqueSlots.map((slot) => ({
    label: slot,
    value: slot,
  }));
  const years = filterOptions?.uniqueYears.map((year) => ({
    label: year,
    value: year,
  }));
  const semesters = filterOptions?.uniqueSemesters.map((semester) => ({
    label: semester,
    value: semester,
  }));
  const campuses = filterOptions?.uniqueCampuses.map((campus) => ({
    label: campus,
    value: campus,
  }));
  useEffect(() => {
    // console.log(slots);
  });
  const handleResetFilters = () => {
    setSelectedExams([]);
    setSelectedSlots([]);
    setSelectedYears([]);
    router.push(`/catalogue?subject=${encodeURIComponent(subject!)}`);
  };
  function removeThis<dunno>(
    event: React.MouseEvent,
    mainStuff: dunno,
    selectedStuff: dunno[],
    setSelectedStuff: React.Dispatch<React.SetStateAction<dunno[]>>,
  ) {
    event.stopPropagation();
    if (selectedStuff.includes(mainStuff)) {
      setSelectedStuff(
        selectedStuff.filter((el) => {
          return el != mainStuff;
        }),
      );
    }
  }

  function weAdding<dunno>(
    event: React.MouseEvent,
    mainstuff: dunno,
    selectedStuff: dunno[],
    setSelectedStuff: React.Dispatch<React.SetStateAction<dunno[]>>,
  ) {
    event.stopPropagation();
    if (!selectedStuff.includes(mainstuff)) {
      setSelectedStuff((prevItems) => [...prevItems, mainstuff]);
    }
  }

  return (
    <div className=" sticky top-0 mb-10 flex w-[30%] flex-col items-baseline border-r-2 border-[#36266d] py-[40px]">
      <div className="w-[120%] px-[10px] md:w-[100%]">
        <SearchBar />
      </div>
      <div className="flex w-full gap-8 border-b-2 border-[#36266d] px-[10px] pb-4 pt-8">
        <div className="hidden flex-col items-baseline justify-center gap-2 md:flex md:justify-end 2xl:mr-4">
          <div>
            <Button
              variant="outline"
              onClick={handleSelectAll}
              className="mr-2 border-2 border-black font-sans font-semibold hover:bg-slate-800 hover:text-white dark:border-[#434dba] dark:hover:border-white dark:hover:bg-slate-900"
            >
              Select All
            </Button>
            <Button
              variant="outline"
              onClick={handleDeselectAll}
              className="border-2 border-black font-sans font-semibold hover:bg-slate-800 hover:text-white dark:border-[#434dba] dark:hover:border-white dark:hover:bg-slate-900"
            >
              Deselect All
            </Button>
          </div>
          <Button
            variant="outline"
            onClick={handleDownloadAll}
            disabled={selectedPapers.length === 0}
            className="border-2 border-black font-sans font-semibold hover:bg-slate-800 hover:text-white dark:border-[#434dba] dark:hover:border-white dark:hover:bg-slate-900"
          >
            Download All ({selectedPapers.length})
          </Button>
        </div>
      </div>
      <div className="flex w-full items-center justify-between border-b-2 border-[#36266d] px-[10px] py-4">
        <div className="flex">
          <Image
            src={filterIcon as string}
            width={30}
            height={30}
            alt="Picture of the author"
          />
          <div className="font-sans text-xl font-bold">Filters</div>
        </div>
        <div className="flex flex-col">
          <div
            className="mb-1 cursor-pointer rounded-full border-2 border-black px-2 py-1 font-sans text-xs font-semibold hover:bg-slate-800 hover:text-white dark:border-[#434dba] dark:hover:border-white dark:hover:bg-slate-900"
            onClick={() => {
              handleApplyFilters(selectedExams, selectedSlots, selectedYears);
            }}
          >
            Apply Filters
          </div>
          <div
            className="cursor-pointer rounded-full border-2 border-black px-2 py-1 font-sans text-xs font-semibold hover:bg-slate-800 hover:text-white dark:border-[#434dba] dark:hover:border-white dark:hover:bg-slate-900"
            onClick={handleResetFilters}
          >
            Reset Filters
          </div>
        </div>
      </div>
      <div className="flex w-full items-center justify-between border-b-2 border-[#36266d] px-[10px] py-4">
        <div onClick={()=>{
          setAnswerKey(true)
        }} className={`cursor-pointer flex rounded-full border-2 border-black px-2 py-1 font-sans text-xs font-semibold hover:bg-slate-800 hover:text-white ${answerKey? "dark:border-[#434dba] dark:hover:border-[white]" : "dark:border-white dark:hover:border-[#434dba]"} dark:hover:bg-slate-900`}>
          Answer Key Available
          {answerKey && (<XIcon
            className="h-4 cursor-pointer text-muted-foreground"
            onClick={(event) => {
              event.stopPropagation();
              setAnswerKey(false)
            }}
          />)}
        </div>
      </div>
      <div className="flex w-full flex-col items-baseline justify-between border-b-2 border-[#36266d] px-[10px]">
        <Accordion className="w-full" type="single" collapsible>
          <AccordionItem className="border-none no-underline " value="item-1">
            <AccordionTrigger className="w-full no-underline ">
              <div className="font-sans text-sm no-underline">Exams</div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="my-2 flex w-full flex-wrap items-center">
                {exams?.map((exam) => {
                  return (
                    <>
                      <div
                        onClick={(event) => {
                          weAdding(
                            event,
                            exam.value,
                            selectedExams,
                            setSelectedExams,
                          );
                        }}
                        className={`mb-2 mr-2 flex h-fit cursor-pointer items-center rounded-full border-2 border-black px-2 py-1 font-sans text-xs font-semibold hover:bg-slate-800 hover:text-white dark:hover:bg-slate-900 ${selectedExams.includes(exam.value) ? "dark:border-[#434dba] dark:hover:border-[white]" : "dark:border-white dark:hover:border-[#434dba]"}`}
                      >
                        {exam.label}
                        {selectedExams.includes(exam.value) && (
                          <XIcon
                            className="h-4 cursor-pointer text-muted-foreground"
                            onClick={(event) => {
                              removeThis(
                                event,
                                exam.value,
                                selectedExams,
                                setSelectedExams,
                              );
                            }}
                          />
                        )}
                      </div>
                    </>
                  );
                })}
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
      <div className="flex w-full flex-col items-baseline justify-between border-b-2 border-[#36266d] px-[10px]">
        <Accordion className="w-full" type="single" collapsible>
          <AccordionItem className="border-none no-underline " value="item-1">
            <AccordionTrigger className="w-full no-underline ">
              <div className="font-sans text-sm no-underline">Slots</div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="my-2 flex w-full flex-wrap items-center">
                {slots?.map((slot) => {
                  return (
                    <>
                      <div
                        onClick={(event) => {
                          weAdding(
                            event,
                            slot.value,
                            selectedSlots,
                            setSelectedSlots,
                          );
                        }}
                        className={`mb-2 mr-2 flex h-fit cursor-pointer items-center rounded-full border-2 border-black px-2 py-1 font-sans text-xs font-semibold hover:bg-slate-800 hover:text-white dark:hover:bg-slate-900 ${selectedSlots.includes(slot.value) ? "dark:border-[#434dba] dark:hover:border-[white]" : "dark:border-white dark:hover:border-[#434dba]"}`}
                      >
                        {slot.label}
                        {selectedSlots.includes(slot.value) && (
                          <XIcon
                            className="h-4 cursor-pointer text-muted-foreground"
                            onClick={(event) => {
                              removeThis(
                                event,
                                slot.value,
                                selectedSlots,
                                setSelectedSlots,
                              );
                            }}
                          />
                        )}
                      </div>
                    </>
                  );
                })}
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
      <div className="flex w-full flex-col items-baseline justify-between border-b-2 border-[#36266d] px-[10px]">
        <Accordion className="w-full" type="single" collapsible>
          <AccordionItem className="border-none no-underline " value="item-1">
            <AccordionTrigger className="w-full no-underline ">
              <div className="font-sans text-sm no-underline">Years</div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="my-2 flex w-full flex-wrap items-center">
                {years?.map((year) => {
                  return (
                    <>
                      <div
                        onClick={(event) => {
                          weAdding(
                            event,
                            year.value,
                            selectedYears,
                            setSelectedYears,
                          );
                        }}
                        className={`mb-2 mr-2 flex h-fit cursor-pointer items-center rounded-full border-2 border-black px-2 py-1 font-sans text-xs font-semibold hover:bg-slate-800 hover:text-white dark:hover:bg-slate-900 ${selectedYears.includes(year.value) ? "dark:border-[#434dba] dark:hover:border-[white]" : "dark:border-white dark:hover:border-[#434dba]"}`}
                      >
                        {year.label}
                        {selectedYears.includes(year.value) && (
                          <XIcon
                            className="h-4 cursor-pointer text-muted-foreground"
                            onClick={(event) => {
                              removeThis(
                                event,
                                year.value,
                                selectedYears,
                                setSelectedYears,
                              );
                            }}
                          />
                        )}
                      </div>
                    </>
                  );
                })}
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
      <div className="flex w-full flex-col items-baseline justify-between border-b-2 border-[#36266d] px-[10px]">
        <Accordion className="w-full" type="single" collapsible>
          <AccordionItem className="border-none no-underline " value="item-1">
            <AccordionTrigger className="w-full no-underline ">
              <div className="font-sans text-sm no-underline">Semesters</div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="my-2 flex w-full flex-wrap items-center">
                {semesters?.map((semester) => {
                  return (
                    <>
                      <div
                        onClick={(event) => {
                          weAdding(
                            event,
                            semester.value,
                            selectedSemesters,
                            setSelectedSemesters,
                          );
                        }}
                        className={`mb-2 mr-2 flex h-fit cursor-pointer items-center rounded-full border-2 border-black px-2 py-1 font-sans text-xs font-semibold hover:bg-slate-800 hover:text-white dark:hover:bg-slate-900 ${selectedSemesters.includes(semester.value) ? "dark:border-[#434dba] dark:hover:border-[white]" : "dark:border-white dark:hover:border-[#434dba]"}`}
                      >
                        {semester.label}
                        {selectedSemesters.includes(semester.value) && (
                          <XIcon
                            className="h-4 cursor-pointer text-muted-foreground"
                            onClick={(event) => {
                              removeThis(
                                event,
                                semester.value,
                                selectedSemesters,
                                setSelectedSemesters,
                              );
                            }}
                          />
                        )}
                      </div>
                    </>
                  );
                })}
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
      <div className="flex w-full flex-col items-baseline justify-between border-b-2 border-[#36266d] px-[10px]">
        <Accordion className="w-full" type="single" collapsible>
          <AccordionItem className="border-none no-underline " value="item-1">
            <AccordionTrigger className="w-full no-underline ">
              <div className="font-sans text-sm no-underline">Campuses</div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="my-2 flex w-full flex-wrap items-center">
                {campuses?.map((campus) => {
                  return (
                    <>
                      <div
                        onClick={(event) => {
                          weAdding(
                            event,
                            campus.value,
                            selectedCampuses,
                            setSelectedCampuses,
                          );
                        }}
                        className={`mb-2 mr-2 flex h-fit cursor-pointer items-center rounded-full border-2 border-black px-2 py-1 font-sans text-xs font-semibold hover:bg-slate-800 hover:text-white dark:hover:bg-slate-900 ${selectedCampuses.includes(campus.value) ? "dark:border-[#434dba] dark:hover:border-[white]" : "dark:border-white dark:hover:border-[#434dba]"}`}
                      >
                        {campus.label}
                        {selectedCampuses.includes(campus.value) && (
                          <XIcon
                            className="h-4 cursor-pointer text-muted-foreground"
                            onClick={(event) => {
                              removeThis(
                                event,
                                campus.value,
                                selectedCampuses,
                                setSelectedCampuses,
                              );
                            }}
                          />
                        )}
                      </div>
                    </>
                  );
                })}
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </div>
  );
}

export default SideBar;
