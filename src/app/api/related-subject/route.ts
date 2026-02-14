import { NextResponse, type NextRequest } from "next/server";
import { customErrorHandler } from "@/lib/utils/error";
import { getRelatedSubjects } from "@/lib/services/subjects";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    
    const url = req.nextUrl.searchParams;
    const sub = url.get("subject");

    const subjects = await getRelatedSubjects(sub || "");

    return NextResponse.json(
      { related_subjects: subjects[0]?.related_subjects },
      { status: 200 },
    );
  } catch (error) {
    return customErrorHandler(error, "Failed to fetch related subject");
  }
}