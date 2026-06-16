import { connectToDatabase } from "@/lib/database/mongoose";
import Paper from "@/db/papers";
import { type StoredSubjects } from "@/interface";
import { transformPapersToSubjectSlots } from "@/lib/services/paper-transform";
import { success, failure } from "@/lib/utils/response";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    await connectToDatabase();
    const subjects = (await req.json()) as StoredSubjects;

    const usersPapers = await Paper.find({
      subject: { $in: subjects },
    });

    console.log("Fetched user papers:", usersPapers);

    const transformedPapers = transformPapersToSubjectSlots(usersPapers);

    return success(transformedPapers);
  } catch (error) {
    console.error("Error fetching papers:", error);
    return failure("Failed to fetch papers.", 500);
  }
}
