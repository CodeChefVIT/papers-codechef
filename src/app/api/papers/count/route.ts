import { getCourseCounts } from "@/lib/services/paper";
import { success, failure } from "@/lib/utils/response";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const courseCount = await getCourseCounts();

    return success(courseCount);
  } catch (error) {
    return failure("Failed to fetch course counts", 500, error);
  }
}
