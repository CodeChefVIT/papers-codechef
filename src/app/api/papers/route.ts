import { NextResponse, type NextRequest } from "next/server";
import { getPapersBySubject } from "@/lib/services/paper";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {

    const url = req.nextUrl.searchParams;
    const sub = url.get("subject");

    const paper = await getPapersBySubject(sub as string);

    return NextResponse.json(
      paper,
      { status: 200 },
    );
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json(
        { message: "Failed to fetch papers", error: error.message },
        { status: error.message === "Subject query parameter is required" ? 400 : 500 },
      );
    }
    return NextResponse.json(
      { message: "Failed to fetch papers", error},
      { status: 500 },
    );
  }
}