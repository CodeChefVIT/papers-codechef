import { PaperAdmin } from "@/db/papers";
import { createPDFfromImages, compressPDF } from "@/lib/storage/pdf";
import { uploadPDF } from "@/lib/storage/gcp";
import { connectToDatabase } from "@/lib/database/mongoose";

const MAX_COMPRESSED_PDF_SIZE = 5 * 1024 * 1024; // 5MB compressed
const COMPRESS_THRESHOLD = 5 * 1024 * 1024; // 5MB

type UploadPaperInput = {
  files: File[];
  isPdf: boolean;
  campus: string | null;
};

type UploadPaperResult =
  | { success: true; file_url: string }
  | { success: false; message: string; status: number };

export async function uploadPaper({
  files,
  isPdf,
  campus,
}: UploadPaperInput): Promise<UploadPaperResult> {
  await connectToDatabase();
  
  let pdfBytes: Uint8Array;

  if (isPdf) {
    if (!files[0]) {
      return { success: false, message: "No PDF file provided.", status: 400 };
    }

    if (files[0].size > COMPRESS_THRESHOLD) {
      return {
        success: false,
        message: "PDF file exceeds the 5MB limit. Please select a PDF file under 5MB.",
        status: 400,
      };
    }

    const rawPdfBytes = new Uint8Array(await files[0].arrayBuffer());
    pdfBytes = await compressPDF(rawPdfBytes);
    if (pdfBytes.length > MAX_COMPRESSED_PDF_SIZE) {
      return {
        success: false,
        message: "PDF is too large after compression. The compressed file must be under 5MB.",
        status: 413,
      };
    }
  } else {
    pdfBytes = await createPDFfromImages(files);
    if (pdfBytes.length > MAX_COMPRESSED_PDF_SIZE) {
      return {
        success: false,
        message: "Generated PDF is too large after compression. Please upload fewer or smaller images.",
        status: 413,
      };
    }
  }

  const buffer = Buffer.from(pdfBytes);
  const file_url = await uploadPDF("unapproved", buffer);

  const paper = new PaperAdmin({
    file_url,
    thumbnail_url: null,
    campus,
    subject: null,
    slot: null,
    year: null,
    exam: null,
    semester: null,
    ambiguous_tags: [],
  });
  await paper.save();

  return { success: true, file_url };
}
