import { NextResponse } from "next/server";
import { PDFDocument } from "pdf-lib";
import { campuses, exams, semesters, slots, years } from "@/components/select_options";
import { connectToDatabase } from "@/lib/mongoose";
import cloudinary from "cloudinary";
import { type ICourses, type CloudinaryUploadResult } from "@/interface";
import { PaperAdmin } from "@/db/papers";
import axios from "axios";
// TODO: REMOVE THUMBNAIL FROM admin-buffer DB
cloudinary.v2.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_SECRET,
});

export async function POST(req: Request) {
  try {
    if (!process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET) {
      return NextResponse.json({ message: "ServerMisconfig" }, { status: 500 });
    }
    const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;
    const formData = await req.formData();
    const files: File[] = formData.getAll("files") as File[];

    const subject = formData.get("subject") as string;
    const slot = formData.get("slot") as string;
    const year = formData.get("year") as string;
    const exam = formData.get("exam") as string;
    const campus = formData.get("campus") as string;
    const semester = formData.get("semester") as string;

    const isPdf = formData.get("isPdf") === "true"; // Convert string to boolean

    const { data } = await axios.get<ICourses[]>(`${process.env.SERVER_URL}/api/course-list`);
    const courses = data.map((course: { name: string }) => course.name);
    if (
      !(
        courses.includes(subject) &&
        slots.includes(slot) &&
        years.includes(year) &&
        exams.includes(exam) &&
        campuses.includes(campus) &&
        semesters.includes(semester) 
      )
    ) {
      return NextResponse.json({ message: "Bad Request" }, { status: 400 });
    }

    await connectToDatabase();
    let finalUrl: string | undefined = "";
    let public_id_cloudinary: string | undefined = "";
    let thumbnailUrl: string | undefined = "";

    if (!files || files.length === 0) {
      return NextResponse.json(
        { error: "No files received." },
        { status: 400 },
      );
    }
    if (!isPdf) {
      try {
        if (!process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET) {
          return;
        }

        const mergedPdfBytes = await CreatePDF(files);
        [public_id_cloudinary, finalUrl] = await uploadPDFFile(
          mergedPdfBytes,
          uploadPreset,
        );
      } catch (error) {
        return NextResponse.json(
          { error: "Failed to process PDF" },
          { status: 500 },
        );
      }
    } else {
      [public_id_cloudinary, finalUrl] = await uploadPDFFile(
        files[0]!,
        uploadPreset,
      );
    }

    const thumbnailResponse = cloudinary.v2.image(finalUrl!, {
      format: "jpg",
    });
    thumbnailUrl = thumbnailResponse
      .replace("pdf", "jpg")
      .replace("upload", "upload/w_400,h_400,c_fill")
      .replace(/<img src='|'\s*\/>/g, "");
    const paper = new PaperAdmin({
      public_id_cloudinary,
      finalUrl,
      thumbnailUrl,
      subject,
      slot,
      year,
      exam,
      campus,
      semester
    });
    await paper.save();
    return NextResponse.json(
      { status: "success", url: finalUrl, thumbnailUrl: thumbnailUrl },
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

async function uploadPDFFile(file: File | ArrayBuffer, uploadPreset: string) {
  let bytes;
  if (file instanceof File) {
    bytes = await file.arrayBuffer();
  } else {
    bytes = file;
  }
  return uploadFile(bytes, uploadPreset, "application/pdf");
}

async function uploadFile(
  bytes: ArrayBuffer,
  uploadPreset: string,
  fileType: string,
) {
  try {
    const buffer = Buffer.from(bytes);
    const dataUrl = `data:${fileType};base64,${buffer.toString("base64")}`;
    const uploadResult = (await cloudinary.v2.uploader.unsigned_upload(
      dataUrl,
      uploadPreset,
    )) as CloudinaryUploadResult;
    return [uploadResult.public_id, uploadResult.secure_url];
  } catch (e) {
    throw e;
  }
}

async function CreatePDF(files: File[]) {
  const pdfDoc = await PDFDocument.create();

  const orderedFiles = files;

  for (const file of orderedFiles) {
    const fileBlob = new Blob([file]);
    const imgBytes = Buffer.from(await fileBlob.arrayBuffer());
    let img;
    if (file instanceof File) {
      if (file.type === "image/png") {
        img = await pdfDoc.embedPng(imgBytes);
      } else if (file.type === "image/jpeg" || file.type === "image/jpg") {
        img = await pdfDoc.embedJpg(imgBytes);
      } else {
        continue;
      }
      const page = pdfDoc.addPage([img.width, img.height]);
      page.drawImage(img, {
        x: 0,
        y: 0,
        width: img.width,
        height: img.height,
      });
    }
  }

  const mergedPdfBytes = await pdfDoc.save();
  return mergedPdfBytes;
}
