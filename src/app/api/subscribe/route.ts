import { NextResponse } from "next/server";
import { customErrorHandler } from "@/lib/utils/error";
import { subscribeEmail } from "@/lib/services/subscribe";

export async function POST(req: Request) {
  try {
    const { email } = (await req.json()) as { email: string };

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }
    await subscribeEmail(email);

    return NextResponse.json({ message: "Email added successfully" });
  } catch (error) {
    console.error("Error adding email:", error);
    return customErrorHandler(error, "Failed to add email");
  }
} 