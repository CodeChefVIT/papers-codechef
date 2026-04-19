import { getRelatedSubjects } from "@/lib/services/subject";
import { NextResponse, type NextRequest } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const url = req.nextUrl.searchParams;
    const subject = url.get("subject");

    if (!subject) {
      return NextResponse.json(
        { message: "Subject query parameter is required" },
        { status: 400 },
      );
    }
    const relatedSubjects = await getRelatedSubjects(subject);

    return NextResponse.json(
      {related_subjects: relatedSubjects},
      { status: 200 },
    );
  } catch (error) {
    return NextResponse.json(
      { message: "Failed to fetch related subject", error },
      { status: 500 },
    );
  }
}