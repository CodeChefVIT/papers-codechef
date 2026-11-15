import { Ratelimit } from "@upstash/ratelimit";
import { redis } from "./redis";

type Window = Parameters<typeof Ratelimit.slidingWindow>[1];

function allow(requests: number, window: Window) {
  return redis
    ? new Ratelimit({ redis, limiter: Ratelimit.slidingWindow(requests, window) })
    : null;
}

export const aiUploadRatelimit = allow(5, "900 s");

export const paperRequestRatelimit = allow(5, "900 s");

export const subscribeRatelimit = allow(3, "1 h");
