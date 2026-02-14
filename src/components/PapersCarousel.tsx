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
import { Skeleton } from "@/components/ui/skeleton";
import SkeletonPaperCard from "@/components/SkeletonPaperCard";

function PapersCarousel() {
  const [displayPapers, setDisplayPapers] = useState<IUpcomingPaper[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [chunkSize, setChunkSize] = useState<number>(4); // dynamic chunk size

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

  useEffect(() => {
    const fetchPapers = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get<IUpcomingPaper[]>(
          "/api/upcoming-papers",
        );
        setDisplayPapers(response.data);
      } catch (error) {
        console.error("Failed to fetch papers:", error);
      } finally {
        setIsLoading(false);
      }
    };
    void fetchPapers();
    const handleUpdate = () => void fetchPapers();
    window.addEventListener("updatePapers", handleUpdate);

    return () => {
      window.removeEventListener("updatePapers", handleUpdate);
    };
  }, []);

  const chunkedPapers = chunkArray(displayPapers, chunkSize);
  const plugins = [Autoplay({ delay: 8000, stopOnInteraction: true })];

  if (chunkedPapers.length === 0)
    return (
      <div className="mt-3 px-4">
        <p className="my-8 text-center font-play text-lg font-semibold md:block">
          Upcoming Exams
        </p>
        <p className="my-8 text-center font-play text-lg font-semibold md:block">
          <i>No more upcoming papers, Enjoy your break!</i>
        </p>
      </div>
    );

  return (
    <div className="mt-3 px-4">
      <p className="my-8 text-center font-play text-lg font-semibold md:block">
        Upcoming Exams
      </p>

      <Carousel
        opts={{ align: "start", loop: true }}
        plugins={plugins}
        className="w-full"
      >
        {/* Only show arrows when there are multiple chunks to scroll through */}
        {chunkedPapers.length > 1 && displayPapers.length > chunkSize && (
          <div className="relative mt-4 flex justify-end gap-4">
            <CarouselPrevious className="relative" />
            <CarouselNext className="relative" />
          </div>
        )}

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
              const placeholdersNeeded = chunkSize - paperGroup.length;

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
                  {paperGroup.map((paper, subIndex) => (
                    <div key={subIndex} className="h-full">
                      <UpcomingPaper
                        subject={paper.subject}
                        slots={paper.slots}
                      />
                    </div>
                  ))}

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
    </div>
  );
}

export default PapersCarousel;
