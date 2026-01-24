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
interface ReportTagBody {
  paperId?: string;
  reportedFields?: unknown;
  comment?: unknown;
  reporterEmail?: unknown;
  reporterId?: unknown;
}

const ALLOWED_FIELDS = ["subject", "courseCode", "exam", "slot", "year"];

function getRateLimit(){
  return new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(3, "1 h"),//per id - 3 request - per hour
    analytics: true,
});
}
function getClientIp(req: Request & { ip?: string}): string {
  return req.ip ?? "127.0.0.1";
}

export async function POST(req: Request & { ip?: string }) {
  try {
    await connectToDatabase();
    const ratelimit = getRateLimit();
    const body = (await req.json()) as ReportTagBody;
    const paperId = typeof body.paperId === "string" ? body.paperId : undefined;

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
            .map((r): ReportedFieldInput | null => {
               if (!r || typeof r !== "object") return null;

              const field = typeof (r as { field?: unknown }).field === "string" ? (r as { field: string }).field.trim() : "";
              const value = typeof (r as { value?: unknown }).value === "string" ? (r as { value: string }).value.trim() : undefined;
             return field ? { field, value } : null;
            })
             .filter((r): r is ReportedFieldInput => r !== null):[];

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
      comment: typeof body.comment === "string" ? body.comment : undefined,
      reporterEmail: typeof body.reporterEmail === "string" ? body.reporterEmail : undefined,
      reporterId: typeof body.reporterId === "string" ? body.reporterId : undefined,

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
