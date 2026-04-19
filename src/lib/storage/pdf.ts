import { PDFDocument } from "pdf-lib";

export async function createPDFfromImages(files: File[]): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create();

  for (const file of files) {
    const imgBytes = Buffer.from(await file.arrayBuffer());
    let img;
    if (file.type === "image/png") {
      img = await pdfDoc.embedPng(imgBytes);
    } else if (file.type === "image/jpeg" || file.type === "image/jpg") {
      img = await pdfDoc.embedJpg(imgBytes);
    } else continue;

    const page = pdfDoc.addPage([img.width, img.height]);
    page.drawImage(img, { x: 0, y: 0, width: img.width, height: img.height });
  }

  return pdfDoc.save();
}
