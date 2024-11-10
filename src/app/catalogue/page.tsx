import { Suspense } from "react";
import Navbar from "@/components/Navbar";
import Loader from "@/components/ui/loader";
import CatalogueContent from "@/components/CatalogueContent";
import { Paper } from "@/interface";
import getPapers from "@/actions/get-papers-by-sub";
import { Metadata } from "next";
import StoredPapers from "@/components/StoredPapers";

interface PageProps {
  searchParams: {
    subject?: string;
    exams?: string;
    slots?: string;
    years?: string;
  };
}

export async function generateMetadata({ searchParams }: PageProps): Promise<Metadata> {
  if (searchParams.subject) {
    return {
      title: `Papers by CodeChef-VIT | ${Paper.subject}`,
      openGraph: {
        title: `Papers by CodeChef-VIT | ${Paper.subject}`,
      },
      twitter: {
        title: `Papers by CodeChef-VIT | ${Paper.subject}`,
      }
    };
  }
  return {};
}

export default async function CataloguePage({ searchParams }: PageProps) {
  const { subject, exams, slots, years } = searchParams;
  
  let papersData = null;
  let error = null;

  if (subject) {
    try {
      papersData = await getPapers(subject);
      if (papersData?.papers) {
        papersData.papers = papersData.papers.filter((paper: Paper) => {
          const examCondition = exams?.length ? exams.split(',').includes(paper.exam) : true;
          const slotCondition = slots?.length ? slots.split(',').includes(paper.slot) : true;
          const yearCondition = years?.length ? years.split(',').includes(paper.year) : true;
          return examCondition && slotCondition && yearCondition;
        });
      }
    } catch (e) {
      error = "Error fetching papers";
    }
  }

  return (
    <>
      <Navbar />
      <Suspense fallback={<Loader />}>
        <CatalogueContent 
          papers={papersData?.papers ?? []}
          filterOptions={papersData}
          exams={exams?.split(",")}
          slots={slots?.split(",")}
          years={years?.split(",")}
          subject={subject}
          error={error}
        />
      </Suspense>
    </>
  );
}
