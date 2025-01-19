import { NextResponse, type NextRequest } from "next/server";
import { connectToDatabase } from "@/lib/mongoose";
import Paper from "@/db/papers";
import { type IPaper,  } from "@/interface";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    await connectToDatabase();
    const url = req.nextUrl.searchParams;
    const subject = url.get("subject");
    const escapeRegExp = (text: string) => {
      return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    };
    const escapedSubject = escapeRegExp(subject!);

    if (!subject) {
      return NextResponse.json(
        { message: "Subject query parameter is required" },
        { status: 400 },
      );
    }
    console.log((await Paper.find()).map((paper)=>{paper.campus}))
    const papers: IPaper[] = await Paper.find({
      subject: { $regex: new RegExp(`${escapedSubject}`, "i") },
    });
    console.log(papers[0]?.campus)
    if (papers.length === 0) {
      return NextResponse.json(
        { message: "No papers found for the specified subject" },
        { status: 404 },
      );
    }

    const uniqueYears = Array.from(new Set(papers.map((paper) => paper.year)));
    const uniqueSlots = Array.from(new Set(papers.map((paper) => paper.slot)));
    const uniqueExams = Array.from(new Set(papers.map((paper) => paper.exam)));
    const uniqueCampuses = Array.from(new Set(papers.map((paper) => paper.campus)));
    const uniqueSemesters = Array.from(new Set(papers.map((paper) => paper.semester)));

    return NextResponse.json(
      { papers, uniqueYears, uniqueSlots, uniqueExams, uniqueCampuses, uniqueSemesters },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { message: "Failed to fetch papers", error },
      { status: 500 }
    );
  }
}
