import { reportTag, ReportTagBody } from "@/lib/services/report";
import { rateLimitCheck } from "@/lib/utils/rate-limiter";
import { success, failure } from "@/lib/utils/response";
import { customErrorHandler } from "@/lib/utils/error";

export async function POST(req: Request & { ip?: string }) {
  try {
    const body = (await req.json()) as ReportTagBody;
    const paperId = typeof body.paperId === "string" ? body.paperId : undefined;

    if (!paperId) {
      return failure("paperId is required", 400);
    }
    await rateLimitCheck(req, paperId);
    const newReport = await reportTag(paperId, body);

    return success({ message: "Report submitted.", report: newReport }, "Created", 201);
  } catch (err) {
    console.error(err);
    return customErrorHandler(err, "Failed to submit tag report.");
  }
}
