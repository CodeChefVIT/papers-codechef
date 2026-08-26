"use client";

import { useEffect, useState, useRef, useMemo } from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { exams, slots, years } from "@/components/select_options";
import { Input } from "@/components/ui/input";
import axios from "axios";
import posthog from "posthog-js";
import Fuse from "fuse.js";
import { type IUpcomingPaper } from "@/interface";
import UpcomingPaper from "../../components/UpcomingPaper";
import toast from "react-hot-toast";
import { Search } from "lucide-react";
import SkeletonPaperCard from "@/components/SkeletonPaperCard";
import { useCourses } from "@/context/courseContext";
import { type ApiResponse } from '@/interface'

export default function PaperRequest() {
  const [subjects, setSubjects] = useState<string[]>([]);
  const [searchText, setSearchText] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  const [selectedExam, setSelectedExam] = useState<string | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [selectedYear, setSelectedYear] = useState<string | null>(null);
  const suggestionsRef = useRef<HTMLUListElement | null>(null);
  const [displayPapers, setDisplayPapers] = useState<IUpcomingPaper[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { courses } = useCourses();

  useEffect(() => {
    setSubjects(courses.map((course) => course.name));
  }, [courses]);

  useEffect(() => {
    async function fetchPapers() {
      try {
        setIsLoading(true);
        const response = await axios.get<ApiResponse<IUpcomingPaper[]>>("/api/upcoming-papers");

        setDisplayPapers(response.data.data ?? []);
      } catch (error) {
        console.error("Failed to fetch papers:", error);
      } finally {
        setIsLoading(false);
      }
    }

    void fetchPapers();
  }, []);

  const fuse = useMemo(
    () => new Fuse(subjects, { includeScore: true, threshold: 0.3 }),
    [subjects],
  );

  useEffect(() => {
    if (!searchText.trim()) {
      setSuggestions([]);
      return;
    }

    if (selectedSubject && searchText === selectedSubject) {
      setSuggestions([]);
      return;
    }

    const results = fuse.search(searchText);
    setSuggestions(results.map((r) => r.item).slice(0, 10));
  }, [searchText, fuse, selectedSubject]);

  const handleSelectSubject = (subject: string) => {
    setSelectedSubject(subject);
    setSearchText(subject);
    setSuggestions([]);
    setSelectedExam(null);
    setSelectedSlot(null);
    setSelectedYear(null);
  };

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node)
      ) {
        setSuggestions([]);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSubmit = async () => {
    if (!selectedSubject || !selectedExam || !selectedSlot || !selectedYear) {
      toast.error("Please fill all fields before submitting.");
      return;
    }

    try {
      await toast.promise(
        axios.post("/api/request", {
          subject: selectedSubject,
          exam: selectedExam,
          slot: selectedSlot,
          year: selectedYear,
        }),
        {
          loading: "Submitting your request...",
          success: "Your paper request was submitted successfully",
          error: "Failed to submit your request. Please try again later.",
        },
      );

      posthog.capture("paper_request_submitted", {
        exam: selectedExam,
        slot: selectedSlot,
        year: selectedYear,
      });

      setSearchText("");
      setSelectedSubject(null);
      setSelectedExam(null);
      setSelectedSlot(null);
      setSelectedYear(null);
    } catch (error) {
      console.error("Error submitting request:", error);
    }
  };

  return (
    <div className="min-h-screen bg-[#F3F5FF] px-6 py-12 text-black dark:bg-[#070114] dark:text-white">
      <main>
        <div className="mx-auto mb-16 max-w-4xl text-center">
          <h2 className="mb-12 font-vipnabd text-3xl font-extrabold md:text-4xl">
            Specific Paper Request
          </h2>

          <div className="relative mx-auto mb-8 max-w-xl font-play">
            <Input
              type="text"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              placeholder="Search by subject..."
              className={`text-md rounded-lg bg-[#B2B8FF] px-4 py-6 pr-10 font-play tracking-wider text-black shadow-sm ring-0 placeholder:text-black focus:outline-none focus:ring-0 dark:bg-[#7480FF66] dark:text-white placeholder:dark:text-white ${suggestions.length > 0 ? "rounded-b-none" : ""}`}
            />
            <button
              type="button"
              className="absolute inset-y-0 right-0 flex items-center pr-3"
            >
              <Search className="h-5 w-5 text-black dark:text-white" />{" "}
            </button>
            {suggestions.length > 0 && (
              <ul
                ref={suggestionsRef}
                className="absolute z-20 max-h-[250px] w-full max-w-xl overflow-y-auto rounded-md rounded-t-none border border-t-0 bg-white text-center shadow-lg dark:bg-[#303771]"
              >
                {suggestions.map((s, idx) => (
                  <li
                    key={idx}
                    onClick={() => handleSelectSubject(s)}
                    className="cursor-pointer truncate p-2 hover:bg-gray-100 dark:hover:bg-gray-800"
                  >
                    {s}
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="mb-8 flex justify-center gap-4">
            <Select
              onValueChange={setSelectedExam}
              disabled={!selectedSubject}
              value={selectedExam ?? undefined}
            >
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Exam" />
              </SelectTrigger>
              <SelectContent>
                {exams.map((exam) => (
                  <SelectItem key={exam} value={exam}>
                    {exam}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              onValueChange={setSelectedSlot}
              disabled={!selectedSubject}
              value={selectedSlot ?? undefined}
            >
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Slot" />
              </SelectTrigger>
              <SelectContent>
                {slots.map((slot) => (
                  <SelectItem key={slot} value={slot}>
                    {slot}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              onValueChange={setSelectedYear}
              disabled={!selectedSubject}
              value={selectedYear ?? undefined}
            >
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Year" />
              </SelectTrigger>
              <SelectContent>
                {[...years]
                  .sort((a, b) => Number(b) - Number(a))
                  .map((year) => (
                    <SelectItem key={year} value={year}>
                      {year}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>

          <Button
            className="rounded-lg bg-[#4A55FF] px-8 py-3 text-base text-white hover:bg-[#3A44CC] dark:bg-[#9EA8FF] dark:text-black dark:hover:bg-[#7D86E5]"
            onClick={handleSubmit}
          >
            Submit
          </Button>
        </div>
        <p className="my-8 text-center font-play text-lg font-semibold">
          Upcoming Exams
        </p>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          {isLoading ? (
            <SkeletonPaperCard length={8} />
          ) : (
            displayPapers.map((paper, subIndex) => (
              <div key={subIndex} className="h-full">
                <UpcomingPaper subject={paper.subject} slots={paper.slots} />
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  );
}
