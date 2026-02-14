import { NextResponse } from "next/server";
import { getCourseList } from "@/lib/services/subject";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const courses = await getCourseList();
    return NextResponse.json(courses, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Failed to fetch courses", error },
      { status: 500 },
    );
  }
}
