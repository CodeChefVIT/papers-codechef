import { fetchPaperID } from "@/app/actions/get-papers-by-id";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import PdfViewer from "@/components/pdfViewer";
import Loader from "@/components/ui/loader";
import { ErrorResponse, PaperResponse } from "@/interface";
import axios, { AxiosResponse } from "axios";
import { Metadata } from "next";
import { redirect } from "next/navigation"; // Import redirect

export async function generateMetadata({
  params,
}: {
  params: { id: string };
}): Promise<Metadata> {
  const paper: PaperResponse | null = await fetchPaperID(params.id);

  if (paper) {
    const subject = paper.subject;
    return {
      title: `Papers | ${subject}`,
      openGraph: {
        title: "Papers by CodeChef-VIT | Exam Resources",
        images: [{ url: "/papers.png" }],
        url: "https://papers.codechefvit.com/",
        type: "website",
        description:
          "Discover previous year question papers created by CodeChef-VIT at Vellore Institute of Technology. Made with ♡ to help students excel.",
        siteName: "Papers by CodeChef-VIT",
      },
      twitter: {
        title: `Papers | ${subject}`,
      },
    };
  }

  return {
    title: "Paper not found",
  };
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
      } else {
        return "An unknown error occurred";
      }
    }
  }
  const paper = await getPaper();
  if (!paper) {
    return <Loader prop="h-screen w-screen" />;
  }
  return (
    <div>
      <Navbar />
      {typeof paper === "string" ? (
        <div className="text-center text-red-500">
          <h1 className="text-xl font-semibold">Error</h1>
          <p>{paper}</p>
        </div>
      ) : (
        <>
          <h1 className="jost mb-4 text-center text-2xl font-semibold md:mb-10 md:text-3xl">
            {paper.subject} {paper.exam} {paper.slot} {paper.year}
          </h1>
          <center>
            <PdfViewer url={paper.finalUrl}></PdfViewer>
          </center>
        </>
      )}

      <Footer />
    </div>
  );
};
export default PaperPage;
