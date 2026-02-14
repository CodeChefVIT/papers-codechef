import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/database/mongoose";
import TagReport from "@/db/tagReport";
import { Ratelimit } from "@upstash/ratelimit";
import { redis } from "@/lib/utils/redis";
import { exams } from "@/components/select_options";

interface ReportedFieldInput {
  field: string;
  value?: string;
}
const ALLOWED_FIELDS = ["subject", "courseCode", "exam", "slot", "year"];

const ratelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(3, "1 h"),//per id - 3 request - per hour
  analytics: true,
});

function getClientIp(req: Request & { ip?: string}): string {
  return req.ip || "127.0.0.1";
}

export async function POST(req: Request & { ip?: string }) {
  try {
    await connectToDatabase();

    const body = await req.json();
    const { paperId } = body;

    if (!paperId) {
      return NextResponse.json(
        { error: "paperId is required" },
        { status: 400 }
      );
    }
    const ip = getClientIp(req);
    const key = `${ip}::${paperId}`;
    const { success } = await ratelimit.limit(key);

    if (!success) {
      return NextResponse.json(
        { error: "Rate limit exceeded for reporting." },
        { status: 429 }
      );
    }
    const MAX_REPORTS_PER_PAPER = 5; 
    const count = await TagReport.countDocuments({ paperId });

    if (count >= MAX_REPORTS_PER_PAPER) {
      return NextResponse.json(
        { error: "Received many reports; we are currently working on it." },
        { status: 429 }
      );
    }
      const reportedFields: ReportedFieldInput[] = Array.isArray(body.reportedFields)
        ? body.reportedFields
            .map((r:Partial<ReportedFieldInput>) => ({
              field: typeof r.field === "string" ? r.field.trim() : "",
              value: typeof r.value === "string" ? r.value.trim() : undefined,
            }))
            .filter((r:Partial<ReportedFieldInput>) => r.field)
        : [];

    for (const rf of reportedFields) {
      if (!ALLOWED_FIELDS.includes(rf.field)) {
        return NextResponse.json(
          { error: `Invalid field: ${rf.field}` },
          { status: 400 }
        );
      }
      if (rf.field === "exam" && rf.value) {
        if (!exams.some(e => e.toLowerCase() === rf.value?.toLowerCase())) {
          return NextResponse.json(
            { error: `Invalid exam value: ${rf.value}` },
            { status: 400 }
          );
        }
      }
    }

    const newReport = await TagReport.create({
      paperId,
      reportedFields,
      comment: body.comment,
      reporterEmail: body.reporterEmail,
      reporterId: body.reporterId,
    });

    return NextResponse.json(
      { message: "Report submitted.", report: newReport },
      { status: 201 }
    );
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Failed to submit tag report." },
      { status: 500 }
    );
  }
}
