"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { type IUpcomingPaper } from "@/interface";
import UpcomingPaper from "./UpcomingPaper";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";
import { chunkArray } from "@/lib/utils/array";
import { type StoredSubjects } from "@/interface";
import SkeletonPaperCard from "./SkeletonPaperCard";
import PinnedModal from "./ui/PinnedModal";

function PinnedPapersCarousel() {
  const [isLoading, setIsLoading] = useState(true);
  const [chunkSize, setChunkSize] = useState<number>(4);
  const [displayPapers, setDisplayPapers] = useState<IUpcomingPaper[]>([]);
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth <= 540) {
        setChunkSize(2);
      } else if (window.innerWidth <= 920) {
        setChunkSize(4);
      } else {
        setChunkSize(8);
      }
    };

    handleResize(); // initialize
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const chunkedPapers = chunkArray(displayPapers, chunkSize);

  if (chunkedPapers.length > 0) {
    const lastChunkIndex = chunkedPapers.length - 1;
    if ((chunkedPapers[lastChunkIndex]?.length ?? 0) < chunkSize) {
      chunkedPapers[lastChunkIndex] = [
        ...(chunkedPapers[lastChunkIndex] ?? []),
        { subject: "add_subject_button", slots: [] } as IUpcomingPaper,
      ];
    } else {
      chunkedPapers.push([
        { subject: "add_subject_button", slots: [] } as IUpcomingPaper,
      ]);
    }
  }

  const fetchPapers = async () => {
    try {
      setIsLoading(true);

      const storedSubjects = JSON.parse(
        localStorage.getItem("userSubjects") ?? "[]",
      ) as StoredSubjects;

      const response = await axios.post<{ subject: string; slots: string[] }[]>(
        "/api/user-papers",
        storedSubjects,
      );

      const fetchedPapers = response.data;

      const fetchedSubjectsSet = new Set(
        fetchedPapers.map((paper) => paper.subject),
      );

      const storedSubjectsArray = Array.isArray(storedSubjects)
        ? storedSubjects
        : [];
      const missingSubjects = storedSubjectsArray
        .filter((subject: string) => !fetchedSubjectsSet.has(subject))
        .map((subject: string) => ({
          subject,
          slots: [],
        })) as { subject: string; slots: string[] }[];

      const allDisplayPapers = [...fetchedPapers, ...missingSubjects];

      allDisplayPapers.sort((a, b) => {
        const aIndex = storedSubjects.indexOf(a.subject);
        const bIndex = storedSubjects.indexOf(b.subject);

        return (
          (aIndex === -1 ? Number.MAX_SAFE_INTEGER : aIndex) -
          (bIndex === -1 ? Number.MAX_SAFE_INTEGER : bIndex)
        );
      });

      setDisplayPapers(allDisplayPapers);
    } catch (error) {
      console.error("Failed to fetch papers:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void fetchPapers();
  }, []);

  useEffect(() => {
    const handleSubjectsChange = () => {
      void (async () => {
        try {
          const storedSubjects = JSON.parse(
            localStorage.getItem("userSubjects") ?? "[]",
          ) as StoredSubjects;

          const response = await axios.post<
            { subject: string; slots: string[] }[]
          >("/api/user-papers", storedSubjects);

          const fetchedPapers = response.data;

          const fetchedSubjectsSet = new Set(
            fetchedPapers.map((paper) => paper.subject),
          );

          const storedSubjectsArray = Array.isArray(storedSubjects)
            ? storedSubjects
            : [];
          const missingSubjects = storedSubjectsArray
            .filter((subject: string) => !fetchedSubjectsSet.has(subject))
            .map((subject: string) => ({
              subject,
              slots: [],
            })) as { subject: string; slots: string[] }[];

          const allDisplayPapers = [...fetchedPapers, ...missingSubjects];

          allDisplayPapers.sort((a, b) => {
            const aIndex = storedSubjects.indexOf(a.subject);
            const bIndex = storedSubjects.indexOf(b.subject);

            return (
              (aIndex === -1 ? Number.MAX_SAFE_INTEGER : aIndex) -
              (bIndex === -1 ? Number.MAX_SAFE_INTEGER : bIndex)
            );
          });

          setDisplayPapers(allDisplayPapers);
        } catch (error) {
          console.error("Failed to fetch papers:", error);
        }
      })();
    };

    window.addEventListener("userSubjectsChanged", handleSubjectsChange);

    return () => {
      window.removeEventListener("userSubjectsChanged", handleSubjectsChange);
    };
  }, []);

  const plugins = [Autoplay({ delay: 8000, stopOnInteraction: true })];

  return (
    <div className="mt-8 px-4 md:mt-4">
      <div className="">
        {displayPapers.length > 0 ? (
          <Carousel
            opts={{
              align: "start",
              loop: true,
            }}
            plugins={plugins}
            className="w-full"
          >
            {(() => {
              const totalItems = displayPapers.length + 1;
              const needsNav = totalItems > chunkSize;
              return needsNav ? (
                <div className="relative mt-4 flex justify-end gap-4">
                  <CarouselPrevious className="relative" />
                  <CarouselNext className="relative" />
                </div>
              ) : null;
            })()}
            <CarouselContent>
              {isLoading ? (
                <CarouselItem
                  className={`grid ${
                    chunkSize === 2
                      ? "grid-cols-1 grid-rows-2"
                      : chunkSize === 4
                        ? "grid-cols-2 grid-rows-2"
                        : "grid-cols-4"
                  } gap-4 lg:auto-rows-fr`}
                >
                  <SkeletonPaperCard length={chunkSize} />
                </CarouselItem>
              ) : (
                chunkedPapers.map((paperGroup, index) => {
                  const placeholdersNeeded =
                    (chunkSize - paperGroup.length) % chunkSize;
                  return (
                    <CarouselItem
                      key={`carousel-item-${index}`}
                      className={`grid ${
                        chunkSize === 2
                          ? "grid-cols-1 grid-rows-2"
                          : chunkSize === 4
                            ? "grid-cols-2 grid-rows-2"
                            : "grid-cols-4"
                      } gap-4 lg:auto-rows-fr`}
                    >
                      {paperGroup.map((paper, subIndex) =>
                        paper.subject === "add_subject_button" ? (
                          <div
                            key={subIndex}
                            className="h-full rounded-sm border border-dashed border-[#734DFF] bg-[#FFFFFF] font-bold hover:bg-[#EFEAFF] dark:border-[#36266D] dark:bg-transparent dark:hover:bg-[#1A1823]"
                          >
                            <PinnedModal
                              triggerName={"Add Subjects"}
                              page={"Carousel"}
                            />
                          </div>
                        ) : (
                          <div key={subIndex} className="h-full">
                            <UpcomingPaper
                              subject={paper.subject}
                              slots={paper.slots}
                            />
                          </div>
                        ),
                      )}

                      {Array.from({ length: placeholdersNeeded }).map(
                        (_, placeholderIndex) => (
                          <div
                            key={`placeholder-${placeholderIndex}`}
                            className="invisible h-full"
                          ></div>
                        ),
                      )}
                    </CarouselItem>
                  );
                })
              )}
            </CarouselContent>
          </Carousel>
        ) : (
          <div
            className={`relative flex flex-col items-center justify-center gap-4 text-center font-bold`}
          >
            Start pinning subjects for quick and easy access.
            <div className="flex h-8 items-center gap-1 rounded-full border border-[#3A3745] bg-[#e8e9ff] px-2.5 py-1 text-xs font-semibold text-gray-700 transition hover:bg-slate-50 dark:bg-black dark:text-white dark:hover:bg-[#1A1823] sm:h-9 sm:gap-2 sm:px-3.5 sm:py-1.5 sm:text-sm md:h-10 md:px-4 md:py-2 md:text-base">
              <span className="truncate">
                <PinnedModal />
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default PinnedPapersCarousel;
