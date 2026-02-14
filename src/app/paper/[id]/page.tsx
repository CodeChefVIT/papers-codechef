import { fetchPaperID } from "@/app/actions/get-papers-by-id";
import PdfViewer from "@/components/pdfViewer";
import RelatedPapers from "@/components/RelatedPaper";
import Loader from "@/components/ui/loader";
import { type ErrorResponse, type PaperResponse } from "@/interface";
import { extractBracketContent } from "@/lib/utils/string";
import axios, { type AxiosResponse } from "axios";
import { type Metadata } from "next";
import { redirect } from "next/navigation";
import { PaperProvider } from "@/context/PaperContext";

export async function generateMetadata({
  params,
}: {
  params: { id: string };
}): Promise<Metadata> {
  try {
    const paper: PaperResponse | null = await fetchPaperID(params.id);

    if (paper) {
      return {
        metadataBase: new URL("https://papers.codechefvit.com/"),
        title: `Papers | ${paper.subject} | ${paper.exam} | ${paper.slot}`,
        description: `Discover ${paper.subject}'s question paper created by CodeChef-VIT at Vellore Institute of Technology. Made with ♡ to help students excel.`,
        icons: [{ rel: "icon", url: "/assets/images/favicon.svg" }],
        openGraph: {
          title: `Papers | ${paper.subject} | ${paper.exam} | ${paper.slot}`,
          images: [{ url: "/assets/images/papers.png" }],
          url: "https://papers.codechefvit.com/",
          type: "website",
          description: `Discover ${paper.subject}'s question paper created by CodeChef-VIT at Vellore Institute of Technology. Made with ♡ to help students excel.`,
          siteName: "Papers by CodeChef-VIT",
        },
        twitter: {
          card: "summary_large_image",
          title: `Papers | ${paper.subject} | ${paper.exam} | ${paper.slot}`,
          description: `Discover ${paper.subject}'s question paper created by CodeChef-VIT at Vellore Institute of Technology. Made with ♡ to help students excel.`,
          images: [{ url: "/assets/images/papers.png" }],
        },
        applicationName: "Papers by CodeChef-VIT",
        keywords: [
          "CodeChef",
          "VIT",
          "Vellore Institute of Technology",
          "CodeChef-VIT",
          "Papers",
          "Exam solutions",
          "Student resources",
          "VIT exam papers",
          "Exam preparation",
          "Previous year papers VIT",
          "VITCAT1",
          "VITCAT2",
          "VITFAT",
          "VIT CAT1 papers",
          "VIT CAT2 papers",
          "VIT FAT papers",
          "VIT exam question papers",
          "VIT question bank",
          "VIT previous year question papers",
          "VIT academic resources",
          "VIT exam pattern",
          "VIT preparation tips",
          "VIT question solutions",
          "VIT model papers",
          "VIT solved papers",
          "VIT test papers",
          "VIT sample papers",
          "VIT question papers with solutions",
          "VIT exam guide",
          "VIT CAT1 preparation",
          "VIT CAT2 preparation",
          "VIT FAT preparation",
          "VIT previous year CAT1 papers",
          "VIT previous year CAT2 papers",
          "VIT previous year FAT papers",
          "VIT exam resources",
          "VIT academic help",
          "VIT syllabus",
          "VIT question paper pattern",
          "VIT 2023 papers",
          "VIT 2024 papers",
          "VIT exam practice",
          "VIT question paper archives",
          "VIT study materials",
          "VIT engineering papers",
          "VIT exam strategy",
          "VIT online exam resources",
          "VIT question paper download",
          "VIT important questions",
          "VIT question paper solutions",
          `${paper.subject} question paper`,
          `${paper.exam} question paper`,
          `${paper.slot} question paper`,
          `${paper.year} question paper`,
          `${paper.subject} question paper`,
          `${paper.exam} question paper`,
          `${paper.slot} question paper`,
          `${paper.year} question paper`,
          `${paper.subject} ${paper.exam} question paper`,
          `${paper.subject} ${paper.slot} question paper`,
          `${paper.subject} ${paper.year} question paper`,
          `${paper.exam} ${paper.slot} question paper`,
          `${paper.exam} ${paper.year} question paper`,
          `${paper.subject} ${paper.exam} ${paper.year} question paper`,
          `${paper.subject} ${paper.exam} ${paper.slot} question paper`,
          `${paper.subject} ${paper.year} ${paper.slot} question paper`,
          `${paper.exam} ${paper.year} ${paper.slot} question paper`,
          `${paper.subject} ${paper.exam} ${paper.year} ${paper.slot} question paper`,
          `${paper.year} ${paper.subject} ${paper.slot} question paper`,
          `${paper.year} ${paper.exam} ${paper.subject} question paper`,
          `${paper.exam} ${paper.subject} ${paper.year} question paper`,
          `${paper.slot} ${paper.subject} ${paper.year} question paper`,
          `${paper.slot} ${paper.exam} ${paper.year} question paper`,
        ],
        robots: "index, follow",
      };
    }

    return {
      title: "Paper not found",
    };
  } catch {
    return {
      title: "Paper not found",
    };
  }
}
const PaperPage = async ({ params }: { params: { id: string } }) => {
  async function getPaper() {
    try {
      const paper = await fetchPaperID(params.id);
      return paper;
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const errorResponse = err.response as AxiosResponse<ErrorResponse>;
        if (errorResponse?.status === 400 || errorResponse?.status === 404) {
          redirect("/");
        } else {
          return errorResponse?.data?.message ?? "Failed to fetch paper";
        }
      } else if (err instanceof Error) {
        return err.message;
      } else {
        return String(err);
      }
    }
  }
  const paper = await getPaper();
  if (!paper) {
    return <Loader prop="h-screen w-screen" />;
  }
  return (
    <div>
      {typeof paper === "string" ? (
        <div className="text-center text-red-500">
          <h1 className="text-xl font-semibold">Error</h1>
          <p>{paper}</p>
        </div>
      ) : (
        <>
          <h1 className="my-6 flex justify-center gap-4 text-center font-play text-2xl font-semibold md:mb-10 md:text-3xl">
            <div>
              {paper.subject} {paper.exam} {paper.slot} {paper.year}
            </div>
          </h1>
          <center>
              <PaperProvider
                value={{
                  paperId: params.id,
                  subject: paper.subject,
                  exam: paper.exam,
                  slot: paper.slot,
                  year: paper.year,
                }}
              >
            <PdfViewer
              url={paper.file_url}
              name={`${extractBracketContent(paper.subject)}-${paper.exam}-${paper.slot}-${paper.year}`}
            ></PdfViewer>
            </PaperProvider>
          </center>
          <RelatedPapers />
        </>
      )}
    </div>
  );
};
export default PaperPage;
