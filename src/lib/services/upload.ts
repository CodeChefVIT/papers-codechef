import { PaperAdmin } from "@/db/papers";
import { createPDFfromImages, compressPDF } from "@/lib/storage/pdf";
import { uploadPDF, uploadThumbnail } from "@/lib/storage/gcp";

const MAX_COMPRESSED_PDF_SIZE = 5 * 1024 * 1024; // 5MB compressed
const COMPRESS_THRESHOLD = 5 * 1024 * 1024; // 5MB

type UploadPaperInput = {
  files: File[];
  isPdf: boolean;
  thumbnail: File | null;
  campus: string | null;
};

type UploadPaperResult =
  | { success: true; file_url: string; thumbnail_url: string | null }
  | { success: false; message: string; status: number };

export async function uploadPaper({
  files,
  isPdf,
  thumbnail,
  campus,
}: UploadPaperInput): Promise<UploadPaperResult> {
  let pdfBytes: Uint8Array;

  if (isPdf) {
    if (!files[0]) {
      return { success: false, message: "No PDF file provided.", status: 400 };
    }

    const rawPdfBytes = new Uint8Array(await files[0].arrayBuffer());
    if (rawPdfBytes.length > COMPRESS_THRESHOLD) {
      const compressedPdfBytes = await compressPDF(rawPdfBytes);
      pdfBytes =
        compressedPdfBytes.length <= rawPdfBytes.length ? compressedPdfBytes : rawPdfBytes;

      if (pdfBytes.length > MAX_COMPRESSED_PDF_SIZE) {
        return {
          success: false,
          message: "PDF is too large after compression. The compressed file must be under 5MB.",
          status: 413,
        };
      }
    } else {
      pdfBytes = rawPdfBytes;
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

  let thumbnail_url: string | null = null;
  if (thumbnail) {
    const thumbBuffer = Buffer.from(await thumbnail.arrayBuffer());
    thumbnail_url = await uploadThumbnail(thumbBuffer, file_url);
  }

  const paper = new PaperAdmin({
    file_url,
    thumbnail_url,
    campus,
    subject: null,
    slot: null,
    year: null,
    exam: null,
    semester: null,
    ambiguous_tags: [],
  });
  await paper.save();

  return { success: true, file_url, thumbnail_url };
}
