import { z } from "zod";
import { getPapersBySubjects } from "@/lib/services/paper"
import { success, failure } from "@/lib/utils/response";

export const dynamic = "force-dynamic";

const pinnedSubjects = z.array(z.string().trim().min(1).max(200)).max(100);

export async function POST(req: Request) {
  try {
    const body: unknown = await req.json().catch(() => null);
    const subjects = pinnedSubjects.safeParse(body);

    if (!subjects.success) {
      return failure("send a list of up to 100 subject names", 400);
    }

    const transformedPapers = await getPapersBySubjects(subjects.data)

    return success(transformedPapers);
  } catch (error) {
    console.error("Error fetching papers:", error);
    return failure("Failed to fetch papers.", 500);
  }
}
