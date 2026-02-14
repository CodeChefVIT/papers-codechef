import { NextResponse } from "next/server";
import { customErrorHandler } from "@/lib/utils/error";
import { getPapersById } from "@/lib/services/paper";

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const paper = await getPapersById(id);

    return NextResponse.json(paper, { status: 200 })
  } catch (error) {
      console.error(error);
      return customErrorHandler(error, "Failed to fetch paper");
  }
}
