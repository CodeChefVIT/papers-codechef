import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/database/mongoose";
import Paper from "@/db/papers";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await connectToDatabase();

    const selectedPapers = await Paper.find({ isSelected: true }).limit(8);

    if (selectedPapers.length === 0) {
      return NextResponse.json(
        {
          message: "No selected papers found.",
        },
        { status: 404 },
      );
    }
    return NextResponse.json(selectedPapers, {
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
