import {
  extractBracketContent,
  extractWithoutBracketContent,
} from "@/lib/utils/string";

import { useRouter } from "next/navigation";
import { Pin } from "lucide-react";
import React, { useContext, useEffect, useState } from "react";
import { StoredSubjects } from "@/interface";
import { useCourses } from "@/context/courseContext";
import { Capsule } from "@/components/ui/capsule";

interface PaperCardProps {
  subject: string;
  slots: string[];
}

export default function PaperCard({ subject, slots }: PaperCardProps) {
  const courseName = extractWithoutBracketContent(subject);
  const courseCode = extractBracketContent(subject);
  const { courses, loading, error, refetch } = useCourses();
  const [pinned, setPinned] = useState<boolean>(false);
  const [paperCount, setPaperCount] = useState<number>(0);

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
    window.dispatchEvent(new Event("userSubjectsChanged"));
    if (!current) window.dispatchEvent(new Event("updatePapers"));
  };

  useEffect(() => {
    const currentPinnedSubjects = JSON.parse(
      localStorage.getItem("userSubjects") ?? "[]",
    ) as StoredSubjects;

    setPinned(
      Array.isArray(currentPinnedSubjects) &&
        currentPinnedSubjects.includes(subject),
    );

    if (courseName && Array.isArray(courses)) {
      const matchedCourse = courses.find((course) => course.name === subject);
      setPaperCount(matchedCourse?.count ?? 0);
    } else {
      setPaperCount(0);
    }
  }, [subject, courseName]);

  const router = useRouter();
  return (
    <div
      onClick={(e) => {
        e.preventDefault();
        const queryParams = new URLSearchParams({ subject });
        router.push(`/catalogue?${queryParams.toString()}`);
      }}
      className={`h-full rounded-sm border-2 border-[#734DFF] bg-[#FFFFFF] text-black shadow-lg transition duration-150 ease-in-out dark:border-[#36266D] dark:bg-[#171720] dark:text-white ${
        // ? "cursor-not-allowed opacity-60 hover:bg-[#FFFFFF] dark:hover:bg-[#171720]"
        "cursor-pointer hover:bg-[#EFEAFF] hover:dark:bg-[#262635]"
      }`}
    >
      <div className="border-b-2 border-[#453D60] p-2">
        <div className="flex items-start justify-between">
          <h2 className="rounded-t-lg px-2 py-1 font-play text-base font-bold md:text-lg md:tracking-widest">
            {courseCode}
            <div className="text-sm font-normal">
              {paperCount
                ? `Papers available: ${paperCount}`
                : "Click to explore"}
            </div>
          </h2>

          <button
            onClick={(e) => {
              e.stopPropagation();
              handlePinToggle();
            }}
            className="group z-10 mt-1 text-black dark:text-white"
          >
            <Pin
              className={`h-6 w-6 transform stroke-current transition-all ${
                pinned
                  ? "fill-violet-400 dark:fill-violet-500"
                  : "fill-transparent group-hover:fill-violet-400 dark:group-hover:fill-violet-500"
              } group-hover:scale-110`}
            />
          </button>
        </div>
      </div>

      <div className="flex flex-col justify-between p-4">
        <h2 className="mt-2 font-play text-base font-bold md:text-xl">
          {courseName}
        </h2>

        {
          <div className="mt-4 flex flex-wrap gap-2 font-play">
            {slots?.map((slotValue, index) => (
              <Capsule key={index}>{slotValue}</Capsule>
            ))}
          </div>
        }
      </div>
    </div>
  );
}
