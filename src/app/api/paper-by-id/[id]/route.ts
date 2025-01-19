import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongoose";
import Paper from "@/db/papers";
import { Types } from "mongoose";

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    await connectToDatabase();

    const { id } = params;

    if (!Types.ObjectId.isValid(id)) {
      return NextResponse.json({ message: "Invalid paper ID" }, { status: 400 });
    }

    const paper = await Paper.findById(id);
    
    
    if (!paper) {
      return NextResponse.json({ message: "Paper not found" }, { status: 404 });
    }

    return NextResponse.json(paper, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Failed to fetch paper", error },
      { status: 500 },
    );
  }
}
