import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/database/mongoose";
import { PaperAdmin } from "@/db/papers";
import { createPDFfromImages } from "@/lib/storage/pdf";
import { uploadPDF, uploadThumbnail } from "@/lib/storage/gcp";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    await connectToDatabase();
    const formData = await req.formData();
    const files = formData.getAll("files").filter(Boolean) as File[];
    const isPdf = formData.get("isPdf") === "true";
    const thumb = formData.get("thumbnail") as File | null;

    if (files.length === 0) {
      return NextResponse.json(
        { error: "No files received." },
        { status: 400 },
      );
    }

    let pdfBytes: Uint8Array;
    if (isPdf) {
      if (!files[0]) {
        return NextResponse.json(
          { error: "No PDF file provided." },
          { status: 400 },
        );
      }
      pdfBytes = new Uint8Array(await files[0].arrayBuffer());
    } else {
      pdfBytes = await createPDFfromImages(files);
    }

    const buffer = Buffer.from(pdfBytes);

    const file_url = await uploadPDF("unapproved", buffer);

    let thumbnail_url: string | null = null;
    if (thumb) {
      const thumbBuffer = Buffer.from(await thumb.arrayBuffer());
      thumbnail_url = await uploadThumbnail(thumbBuffer, file_url);
    }

    const paper = new PaperAdmin({
      file_url,
      thumbnail_url,
      campus: formData.get("campus"),
      subject: null,
      slot: null,
      year: null,
      exam: null,
      semester: null,
      ambiguous_tags: [],
    });
    await paper.save();

    return NextResponse.json(
      { status: "success", file_url, thumbnail_url },
      { status: 201 },
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Failed to upload papers", error },
      { status: 500 },
    );
  }
}
