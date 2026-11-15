import { type NextRequest, NextResponse } from "next/server";
import {
  aiUploadRatelimit,
  paperRequestRatelimit,
  subscribeRatelimit,
} from "./lib/utils/ratelimit";
import { failure } from "@/lib/utils/response"

export const config = {
  matcher: ["/api/upload", "/api/request", "/api/subscribe"],
};

export default async function middleware(request: NextRequest) {
  if (!aiUploadRatelimit || !paperRequestRatelimit || !subscribeRatelimit) {
    if (process.env.NODE_ENV === "production") {
      return failure("rate limiting is not configured", 503);
    }
    return NextResponse.next();
  }

  const ip = request.ip ?? "127.0.0.1";
  const { pathname } = request.nextUrl;

  if (pathname === "/api/upload") {
    const { success } = await aiUploadRatelimit.limit(ip);
    if (!success) {
      return failure("You can upload a maximum of 5 papers every 15 minutes", 429);
    }
  }

  if (pathname === "/api/request") {
    const { success } = await paperRequestRatelimit.limit(ip);
    if (!success) {
      return failure("You can submit a maximum of 5 requests every 15 minutes", 429);
    }
  }

  if (pathname === "/api/subscribe") {
    const { success } = await subscribeRatelimit.limit(ip);
    if (!success) {
      return failure("Maximum of 3 newsletter subscriptions per hour", 429);
    }
  }

  return NextResponse.next();
}

