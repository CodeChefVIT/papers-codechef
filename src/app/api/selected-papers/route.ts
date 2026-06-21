import { success, failure } from "@/lib/utils/response";
import { getSelectedPapers } from "@/lib/services/paper";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const selectedPapers = await getSelectedPapers();

    if (selectedPapers.length === 0) {
      return failure("No selected papers found.", 404);
    }
    return success(selectedPapers);
  } catch (error) {
    console.error("Error fetching papers:", error);
    return failure("Failed to fetch papers.", 500);
  }
}