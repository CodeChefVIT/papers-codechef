import { NextResponse, type NextRequest } from "next/server";
import { getPapersBySubject } from "@/lib/services/paper";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const url = req.nextUrl.searchParams;
    const sub = url.get("subject");
    if (!sub) {
      return NextResponse.json(
        { message: "Subject query parameter is required" },
        { status: 400 },
      );
    }
    const paper = await getPapersBySubject(sub);

    return NextResponse.json(paper, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { message: "Failed to fetch papers", error },
      { status: 500 },
    );
  }
}
