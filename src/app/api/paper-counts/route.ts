import { Types } from "mongoose";
import { z } from "zod";
import { countPaperActivity } from "@/lib/services/paper-counts";
import { getClientIp } from "@/lib/utils/rate-limiter";
import { success, failure } from "@/lib/utils/response";

export const dynamic = "force-dynamic";

const paperActivity = z.object({
  kind: z.enum(["view", "download"]),
  paperIds: z
    .array(z.string().refine((id) => Types.ObjectId.isValid(id)))
    .min(1)
    .max(100),
});

export async function POST(req: Request) {
  try {
    const body: unknown = await req.json().catch(() => null);
    const activity = paperActivity.safeParse(body);

    if (!activity.success) {
      return failure("send a kind of view or download and up to 100 paper ids", 400);
    }

    const { kind, paperIds } = activity.data;
    const counts = await countPaperActivity(kind, [...new Set(paperIds)], getClientIp(req));

    return success(counts);
  } catch (error) {
    console.error(error);
    return failure("could not update the paper counts", 500);
  }
}
