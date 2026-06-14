import { getCourseList } from "@/lib/services/subject";
import { success, failure } from "@/lib/utils/response";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const courses = await getCourseList();
    return success(courses);
  } catch (error) {
    console.error(error);
    return failure("Failed to fetch courses", 500);
  }
}
