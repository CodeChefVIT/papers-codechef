import { getRelatedSubjects } from "@/lib/services/subject";
import { type NextRequest } from "next/server";
import { success, failure } from "@/lib/utils/response";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const url = req.nextUrl.searchParams;
    const subject = url.get("subject");

    if (!subject) {
      return failure("Subject query parameter is required", 400);
    }
    const relatedSubjects = await getRelatedSubjects(subject);

    return success({ related_subjects: relatedSubjects });
  } catch (error) {
    console.error(error);
    return failure("Failed to fetch related subject", 500);
  }
}