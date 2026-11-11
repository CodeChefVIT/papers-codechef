import { success, failure } from "@/lib/utils/response";
import { getUpcomingSubjects } from "@/lib/services/subject";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const selectedSubjects = await getUpcomingSubjects();

    return success(selectedSubjects);
  } catch (error) {
    console.error("Error fetching papers:", error);
    return failure("Failed to fetch papers.", 500);
  }
}