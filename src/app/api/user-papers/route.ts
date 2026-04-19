import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/database/mongoose";
import Paper from "@/db/papers";
import { StoredSubjects } from "@/interface";
import { transformPapersToSubjectSlots } from "@/lib/services/paper-transform";

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

    return NextResponse.json(transformedPapers, {
      status: 200,
    });
  } catch (error) {
    console.error("Error fetching papers:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch papers.",
      },
      { status: 500 },
    );
  }
}
