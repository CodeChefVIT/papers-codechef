import { PDFDocument } from "pdf-lib";
import { createCanvas, loadImage } from "canvas";

const DEFAULT_PDF_SAVE_OPTIONS = {
  useObjectStreams: true,
  compress: true,
};
const MAX_IMAGE_DIMENSION = 1600;
const JPEG_QUALITY = 0.72;

async function normalizeImage(file: File) {
  const rawBytes = Buffer.from(await file.arrayBuffer());
  const image = await loadImage(rawBytes);

  const originalWidth = image.width;
  const originalHeight = image.height;
  const scale = Math.min(1, MAX_IMAGE_DIMENSION / Math.max(originalWidth, originalHeight));
  const width = Math.max(1, Math.round(originalWidth * scale));
  const height = Math.max(1, Math.round(originalHeight * scale));

  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext("2d");
  ctx.drawImage(image, 0, 0, width, height);

  return canvas.toBuffer("image/jpeg", {
    quality: JPEG_QUALITY,
    chromaSubsampling: true,
  });
}

export async function createPDFfromImages(files: File[]): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create();

  for (const file of files) {
    const normalizedBytes = await normalizeImage(file);
    const img = await pdfDoc.embedJpg(normalizedBytes);
    const page = pdfDoc.addPage([img.width, img.height]);
    page.drawImage(img, { x: 0, y: 0, width: img.width, height: img.height });
  }

  return pdfDoc.save(DEFAULT_PDF_SAVE_OPTIONS);
}

export async function compressPDF(pdfBytes: Uint8Array): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.load(pdfBytes, { ignoreEncryption: true });
  return pdfDoc.save(DEFAULT_PDF_SAVE_OPTIONS);
}
