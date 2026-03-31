import { type NextRequest, NextResponse } from "next/server";
import { Ratelimit } from "@upstash/ratelimit";
import { kv } from "@vercel/kv";

const ratelimit = new Ratelimit({
  redis: kv,
  limiter: Ratelimit.slidingWindow(100, "900 s"),
});

export const config = {
  matcher: "/api/upload",
};

export default async function middleware(request: NextRequest) {
  const ip = request.ip ?? "127.0.0.1";
  const { success } = await ratelimit.limit(ip);
  return success
    ? NextResponse.next()
    : NextResponse.json(
        { message: "You can upload a maximum of 5 papers every 15 minutes" },
        { status: 429 },
      );
}
