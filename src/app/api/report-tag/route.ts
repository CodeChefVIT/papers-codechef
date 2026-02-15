import { NextResponse } from "next/server";
import { reportTag, ReportTagBody } from "@/lib/services/report";
import { rateLimitCheck } from "@/lib/utils/rate-limiter";
import { customErrorHandler } from "@/lib/utils/error";

export async function POST(req: Request & { ip?: string }) {
  try {
    const body = (await req.json()) as ReportTagBody;
    const paperId = typeof body.paperId === "string" ? body.paperId : undefined;

    if (!paperId) {
      return NextResponse.json(
        { error: "paperId is required" },
        { status: 400 }
      );
    }
    await rateLimitCheck(req, paperId);
    const newReport = await reportTag(paperId, body);

    return NextResponse.json(
      { message: "Report submitted.", report: newReport },
      { status: 201 }
    );
  } catch (err) {
    console.error(err);
    return customErrorHandler(err, "Failed to submit tag report.");
  }
}
