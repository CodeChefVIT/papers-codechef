import { connectToDatabase } from "@/lib/database/mongoose";
import UpcomingSubject from "@/db/upcoming-paper";
import { success, failure } from "@/lib/utils/response";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await connectToDatabase();
    const selectedSubjects = await UpcomingSubject.find()
      .sort({ _id: 1 })
      .limit(16)
      .lean();
    
    if (selectedSubjects.length === 0) {
      return failure("No selected papers found.", 404);
    }

    return success(selectedSubjects);
  } catch (error) {
    console.error("Error fetching papers:", error);
    return failure("Failed to fetch papers.", 500, error);
  }
}
