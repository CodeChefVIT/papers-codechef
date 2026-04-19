import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/database/mongoose";
import PaperRequest from "@/db/paperRequest";

export async function POST(req: Request) {
  try {
    await connectToDatabase();
    const body = (await req.json()) as {
      subject: string;
      exam: string;
      slot: string;
      year: string;
    };

    const { subject, exam, slot, year } = body;

    if (!subject || !exam || !slot || !year) {
      return NextResponse.json(
        { error: "All fields are required." },
        { status: 400 },
      );
    }

    const newRequest = await PaperRequest.create({ subject, exam, slot, year });
    return NextResponse.json(
      { message: "Paper request submitted successfully!", request: newRequest },
      { status: 201 },
    );
  } catch (error) {
    console.error("Error creating paper request:", error);
    return NextResponse.json(
      { error: "Failed to submit request." },
      { status: 500 },
    );
  }
}
