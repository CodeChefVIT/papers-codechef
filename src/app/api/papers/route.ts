import { NextResponse, type NextRequest } from "next/server";
import { getPapersBySubject } from "@/lib/services/paper";
import { customErrorHandler } from "@/lib/utils/error";

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
    return customErrorHandler(error, "Failed to fetch papers");
  }
}