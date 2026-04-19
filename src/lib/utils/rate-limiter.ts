import { redis } from "@/lib/utils/redis";
import { Ratelimit } from "@upstash/ratelimit";
import { CustomError } from "./error";

function getClientIp(req: Request & { ip?: string}): string {
  const xff = req.headers.get("x-forwarded-for");
  if (typeof xff === "string" && xff.length > 0) {
    return xff.split(",")[0]?.trim()??"";
  }
  const xri = req.headers.get("x-real-ip");
  if (typeof xri === "string" && xri.length > 0) {
    return xri;
  }
  return "0.0.0.0";
}

export async function rateLimitCheck(req: Request & { ip?: string }, paperId: string) {
  const ratelimit = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(3, "1 h"),//per id - 3 request - per hour
    analytics: true,
  });

  const ip = getClientIp(req);
  const key = `${ip}::${paperId}`;
  const { success } = await ratelimit.limit(key);

  if (!success) {
    throw new CustomError("Rate limit exceeded for reporting.", 429);
  }
}