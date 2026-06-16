import { connectToDatabase } from "@/lib/database/mongoose";
import Paper from "@/db/papers";
import { success, failure } from "@/lib/utils/response";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await connectToDatabase();

    const selectedPapers = await Paper.find({ isSelected: true }).limit(8);

    if (selectedPapers.length === 0) {
      return failure("No selected papers found.", 404);
    }
    return success(selectedPapers);
  } catch (error) {
    console.error("Error fetching papers:", error);
    return failure("Failed to fetch papers.", 500);
  }
}
