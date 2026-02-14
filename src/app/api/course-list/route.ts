import { NextResponse } from "next/server";
import { getCourses } from "@/lib/services/subjects";
import { customErrorHandler } from "@/lib/utils/error";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const courses = await getCourses();

    return NextResponse.json(courses, { status: 200 });
  } catch (error) {
    return customErrorHandler(error, "Failed to fetch courses");
  }
}
