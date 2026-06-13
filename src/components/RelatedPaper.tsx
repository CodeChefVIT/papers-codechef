"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "next/navigation";
import { type IPaper, type Filters } from "@/interface";
import Card from "@/components/Card";
import Loader from "@/components/ui/loader";
import { Button } from "./ui/button";
import { type ApiResponse } from "@/interface"

const RelatedPapers = () => {
  const params = useParams();
  const id = params?.id as string;

  const [currentPaper, setCurrentPaper] = useState<IPaper | null>(null);
  const [relatedPapers, setRelatedPapers] = useState<IPaper[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const getpaper = await axios.get<ApiResponse<IPaper>>(`/api/paper-by-id/${id}`);
        if (!getpaper.data.data) {
          throw new Error("Paper not found");
        }
        const paper = getpaper.data.data;
        setCurrentPaper(paper);

        const allPapersBySubject = await axios.get<ApiResponse<Filters>>(
          "/api/papers",
          {
            params: { subject: paper.subject },
          },
        );

        const all = allPapersBySubject.data.data?.papers ?? [];

        const sameExam = all
          .filter((p) => p._id !== paper._id && p.exam === paper.exam)
          .slice(0, 4);

        let finalPapers = [...sameExam];

        if (finalPapers.length < 4) {
          const additional = all.filter(
            (p) =>
              p._id !== paper._id &&
              p.exam !== paper.exam &&
              !finalPapers.some((fp) => fp._id === p._id),
          );

          finalPapers = [
            ...finalPapers,
            ...additional.slice(0, 4 - finalPapers.length),
          ];
        }

        setRelatedPapers(finalPapers);
      } catch (err) {
        console.error("Error fetching related papers:", err);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      void fetchData();
    }
  }, [id]);

  if (loading) return <Loader />;
  if (!currentPaper) return <div className="font-vipna">Paper not found.</div>;

  if (relatedPapers.length === 0) {
    return <></>;
  }

  return (
    <div className="space-y-4 p-6 font-vipna">
      <div className="flex items-center justify-between">
        <h2 className="my-6 font-play text-3xl font-semibold">Explore More</h2>

        <Link
          href={`/catalogue?subject=${encodeURIComponent(currentPaper.subject)}`}
          passHref
        >
          <Button
            variant="outline"
            className="flex gap-2 border-2 border-black font-sans font-semibold hover:bg-slate-800 hover:text-white dark:border-[#434dba] dark:hover:border-white dark:hover:bg-slate-900"
          >
            View All
          </Button>
        </Link>
      </div>
      {relatedPapers.length === 0 ? (
        <p className="font-play">No related papers found.</p>
      ) : (
        <div className=" cursor-pointer grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {relatedPapers.map((paper) => (
            <Card
              key={paper._id}
              paper={paper}
              onSelect={() => {
                ("");
              }}
              isSelected={false}
              isShow={false}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default RelatedPapers;
