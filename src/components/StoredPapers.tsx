"use client";
import papers from "ongoing-papers";
import { useEffect, useState } from "react";
import axios from "axios";
import PreviewCard from "@/components/PreviewCard";
import { type IPaper } from "@/interface";
import Loader from "./ui/loader";

function StoredPapers() {
  const [displayPapers, setDisplayPapers] = useState<IPaper[]>([]);

  useEffect(() => {
    async function fetchPapers() {
      try {
        const response = await axios.get("/api/selected-papers");
        setDisplayPapers(response.data as IPaper[]);
      } catch (error) {
        setDisplayPapers(papers);
        console.error("Failed to fetch papers:", error);
      }
    }

    void fetchPapers();
  }, []);

  if (displayPapers.length === 0) {
    return <Loader prop="m-10" />;
  }

  return (
    <>
      <p className="mt-2 mb-6 text-center font-sans text-xl font-semibold">Most Viewed Papers</p>
      <div className="flex flex-wrap justify-center gap-4">
        {displayPapers.map((paper: IPaper) => (
          <PreviewCard key={paper._id} paper={paper} />
        ))}
      </div>
    </>
  );
}

export default StoredPapers;
