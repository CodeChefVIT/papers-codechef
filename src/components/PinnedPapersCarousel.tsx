"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { type IUpcomingPaper } from "@/interface";
import Loader from "./ui/loader";
import UpcomingPaper from "./UpcomingPaper";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Skeleton } from "./ui/skeleton";
import AddPapers from "./AddPapers";
import Autoplay from "embla-carousel-autoplay";
import { chunkArray } from "@/util/utils";
import { StoredSubjects } from "@/interface";
import SkeletonPaperCard from "./SkeletonPaperCard";

function PinnedPapersCarousel({
  carouselType = "upcoming",
}: {
  carouselType: "users" | "upcoming";
}) {
  const [displayPapers, setDisplayPapers] = useState<IUpcomingPaper[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [chunkSize, setChunkSize] = useState<number>(4);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 640) {
        setChunkSize(4);
      } else {
        setChunkSize(8);
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const chunkedPapers = chunkArray(displayPapers, chunkSize);

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
      void fetchPapers();
    };

    window.addEventListener("userSubjectsChanged", handleSubjectsChange);

    return () => {
      window.removeEventListener("userSubjectsChanged", handleSubjectsChange);
    };
  }, []);

  const plugins = [Autoplay({ delay: 8000, stopOnInteraction: true })];

  return (
    <div className="px-4">
      <div className="">
        <Carousel
          opts={{
            align: "start",
            loop: true,
          }}
          plugins={plugins}
          className="w-full"
        >
          {/* <div
            className={`relative mt-4 flex justify-end gap-4 ${displayPapers.length > 0 ? "block" : "hidden"}`}
          >
            <CarouselPrevious className="relative" />
            <CarouselNext className="relative" />
          </div> */}
          <CarouselContent>
            {isLoading ? (
              <CarouselItem
                className={`grid ${
                  chunkSize === 4 ? "grid-cols-2 grid-rows-2" : "grid-cols-4"
                } gap-4 lg:auto-rows-fr`}
              >
                <SkeletonPaperCard length={chunkSize} />
              </CarouselItem>
            ) : (
              chunkedPapers.map((paperGroup, index) => {
                const isLastChunk = index === chunkedPapers.length - 1;

                return (
                  <CarouselItem
                    key={`carousel-item-${index}`}
                    className={`grid ${
                      chunkSize === 4
                        ? "grid-cols-2 grid-rows-2"
                        : "grid-cols-4"
                    } gap-4 lg:auto-rows-fr`}
                  >
                    {paperGroup.map((paper, subIndex) => (
                      <div key={subIndex} className="h-full">
                        <UpcomingPaper
                          subject={paper.subject}
                          slots={paper.slots}
                        />
                      </div>
                    ))}

                    {isLastChunk && displayPapers.length < 8 && (
                      <div
                        className="h-full"
                        onClick={() => {
                          window.dispatchEvent(new Event("addButtonClicked"));
                        }}
                      >
                        <AddPapers />
                      </div>
                    )}
                  </CarouselItem>
                );
              })
            )}
          </CarouselContent>
        </Carousel>
      </div>
    </div>
  );
}

export default PinnedPapersCarousel;
