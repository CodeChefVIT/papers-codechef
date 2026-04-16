import { NextResponse } from "next/server";
import { Types } from "mongoose";
import { getPaperById } from "@/lib/services/paper";

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    
    if (!Types.ObjectId.isValid(id)) {
      return NextResponse.json({ message: "Invalid paper ID" }, { status: 400 });
    }

    const paper = await getPaperById(id);

    return NextResponse.json(paper, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Failed to fetch paper", error },
      { status: 500 },
    );
  }
}
