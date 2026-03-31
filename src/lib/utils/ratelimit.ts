import { Ratelimit } from "@upstash/ratelimit";
import { kv } from "@vercel/kv";

// Rate limiter for AI Upload (5 requests per 15 minutes)
export const aiUploadRatelimit = new Ratelimit({
  redis: kv,
  limiter: Ratelimit.slidingWindow(5, "900 s"),
});

// Rate limiter for Paper Requests (5 requests per 15 minutes)
export const paperRequestRatelimit = new Ratelimit({
  redis: kv,
  limiter: Ratelimit.slidingWindow(5, "900 s"),
});

// Rate limiter for Subscriptions (3 requests per hour)
export const subscribeRatelimit = new Ratelimit({
  redis: kv,
  limiter: Ratelimit.slidingWindow(3, "1 h"),
});
