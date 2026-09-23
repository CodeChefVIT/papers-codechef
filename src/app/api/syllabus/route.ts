import { connectToDatabase } from "@/lib/database/mongoose";
import { Course } from "@/db/course";
import { success, failure } from "@/lib/utils/response";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const subject = searchParams.get("subject");

    if (!subject) {
      return failure("Subject parameter is required", 400);
    }

    await connectToDatabase();

    const course = await Course.findOne(
      { name: subject },
      { syllabus: 1, _id: 0 }
    ).lean<{ syllabus?: string } | null>();

    return success({ syllabus: course?.syllabus ?? null });
  } catch (error) {
    console.error("Error fetching syllabus:", error);
    return failure("Failed to fetch syllabus", 500);
  }
}
