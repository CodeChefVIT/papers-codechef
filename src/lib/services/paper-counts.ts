import { Ratelimit } from "@upstash/ratelimit";
import Paper from "@/db/papers";
import { type PaperCounts } from "@/interface";
import { connectToDatabase } from "@/lib/database/mongoose";
import { redis } from "@/lib/utils/redis";

export type PaperActivity = "view" | "download";

const countedField = { view: "views", download: "downloads" } as const;

const upstashConfigured = Boolean(process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN);

const oncePerHour =
  redis && upstashConfigured
    ? new Ratelimit({ redis, limiter: Ratelimit.fixedWindow(1, "1 h"), prefix: "paper-counts" })
    : null;

async function firstThisHour(key: string) {
  if (!oncePerHour) return true;
  const { success } = await oncePerHour.limit(key);
  return success;
}

export async function countPaperActivity(
  kind: PaperActivity,
  paperIds: string[],
  visitor: string,
): Promise<Record<string, PaperCounts>> {
  await connectToDatabase();

  const firstTimes = await Promise.all(
    paperIds.map((paperId) => firstThisHour(`${visitor}::${kind}::${paperId}`)),
  );
  const newlyCounted = paperIds.filter((_, index) => firstTimes[index]);

  if (newlyCounted.length > 0) {
    await Paper.updateMany(
      { _id: { $in: newlyCounted } },
      { $inc: { [countedField[kind]]: 1 } },
    );
  }

  const papers = await Paper.find(
    { _id: { $in: paperIds } },
    { views: 1, downloads: 1 },
  ).lean();

  return Object.fromEntries(
    papers.map((paper) => [
      String(paper._id),
      { views: paper.views ?? 0, downloads: paper.downloads ?? 0 },
    ]),
  );
}
