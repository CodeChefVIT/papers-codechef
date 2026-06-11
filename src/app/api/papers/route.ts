import { type NextRequest } from "next/server";
import { getPapersBySubject } from "@/lib/services/paper";
import { success, failure } from "@/lib/utils/response";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const url = req.nextUrl.searchParams;
    const sub = url.get("subject");
    if (!sub) {
      return failure("Subject query parameter is required", 400);
    }
    const paper = await getPapersBySubject(sub);

    return success(paper);
  } catch (error) {
    return failure("Failed to fetch papers", 500, error);
  }
}
