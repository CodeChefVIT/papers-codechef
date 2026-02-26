import { NextResponse } from "next/server";
import { getCourseCounts } from "@/lib/services/paper";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const courseCount = await getCourseCounts();

    return NextResponse.json(courseCount, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { message: "Failed to fetch course counts", error },
      { status: 500 },
    );
  }
}
