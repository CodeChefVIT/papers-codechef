import { type StoredSubjects } from "@/interface";
import { getPapersBySubjects } from "@/lib/services/paper"
import { success, failure } from "@/lib/utils/response";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const subjects = (await req.json()) as StoredSubjects;

    const transformedPapers = await getPapersBySubjects(subjects)

    return success(transformedPapers);
  } catch (error) {
    console.error("Error fetching papers:", error);
    return failure("Failed to fetch papers.", 500);
  }
}
