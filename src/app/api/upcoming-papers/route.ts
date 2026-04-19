import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/database/mongoose";
import UpcomingSlot from "@/db/upcoming-slot";
import UpcomingSubject from "@/db/upcoming-paper";
import { calculateCorrespondingSlots } from "@/lib/utils/slot-calculation";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await connectToDatabase();
    const upcomingSlot = await UpcomingSlot.find();
    const slot = upcomingSlot[0]?.slot;
    
    if (!slot) {
      return NextResponse.json(
        {
          message: "No slot found.",
        },
        { status: 404 },
      );
    }

    const correspondingSlots = calculateCorrespondingSlots(slot);
    const selectedSubjects = await UpcomingSubject.find({
      slots: { $in: correspondingSlots },
    });
    
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