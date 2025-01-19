import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongoose";
import Paper from "@/db/papers";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await connectToDatabase();


    const count: number = await Paper.countDocuments();

    return NextResponse.json(
      {  count },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { message: "Failed to fetch papers", error },
      { status: 500 }
    );
  }
}
