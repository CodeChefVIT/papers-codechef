import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/database/mongoose";
import UpcomingSubject from "@/db/upcoming-paper";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await connectToDatabase();
    const selectedSubjects = await UpcomingSubject.find()
      .sort({ _id: 1 })
      .limit(16)
      .lean();
    
    if (selectedSubjects.length === 0) {
      return NextResponse.json(
        {
          message: "No selected papers found.",
        },
        { status: 404 },
      );
    }

    return NextResponse.json(selectedSubjects, {
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
