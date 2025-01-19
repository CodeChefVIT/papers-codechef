import { NextResponse } from "next/server";
import { PDFDocument } from "pdf-lib";
import {
  campuses,
  courses,
  exams,
  semesters,
  slots,
  years,
} from "@/components/select_options";
import { connectToDatabase } from "@/lib/mongoose";
import cloudinary from "cloudinary";
import type {
  ICourses,
  CloudinaryUploadResult,
  ExamDetail,
  IAdminPaper,
} from "@/interface";
import { PaperAdmin } from "@/db/papers";
import axios from "axios";
import processAndAnalyze from "@/util/mistral";
import { examMap } from "./map";
import Fuse from "fuse.js";
// import processAndAnalyze from "./mistral";
// TODO: REMOVE THUMBNAIL FROM admin-buffer DB
cloudinary.v2.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_SECRET,
});
type SemesterType = IAdminPaper["semester"]; // Extract the exam type from the IPaper interface

export async function POST(req: Request) {
  try {
    if (!process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET) {
      return NextResponse.json({ message: "ServerMisconfig" }, { status: 500 });
    }
    const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;
    const formData = await req.formData();
    const files: File[] = formData.getAll("files") as File[];
    const isPdf = formData.get("isPdf") === "true"; // Convert string to boolean


    let imageURL = "";
    if (isPdf) {
      imageURL = formData.get("image") as string;
    } else {
      const bytes = await files[0]?.arrayBuffer();
      if (bytes) {
        const buffer = Buffer.from(bytes);
        imageURL = `data:${"image/png"};base64,${buffer.toString("base64")}`;
      }
    }
    const tags = await processAndAnalyze({ imageURL });

    const finalTags = await setTagsFromCurrentLists(tags);
    console.log("Final tags:", finalTags);
    const subject = finalTags["course-name"];
    const slot = finalTags.slot;
    const exam = finalTags["exam-type"];
    const year = finalTags.year;
    const campus = formData.get("campus") as string;
    const semester = finalTags.semester;

    if (!courses.includes(subject)) {
      return NextResponse.json(
        { message: "The course subject is invalid." },
        { status: 400 },
      );
    }

    if (!slots.includes(slot)) {
      return NextResponse.json(
        { message: "The slot is invalid." },
        { status: 400 },
      );
    }

    if (!exam.includes(exam)) {
      return NextResponse.json(
        { message: "The exam type is invalid." },
        { status: 400 },
      );
    }

    if (!years.includes(year)) {
      return NextResponse.json(
        { message: "The year is invalid." },
        { status: 400 },
      );
    }

    if (!campuses.includes(campus)) {
      return NextResponse.json(
        { message: `The ${campus} is invalid.` },
        { status: 400 },
      );
    }

    if (!semesters.includes(semester)) {
      return NextResponse.json(
        { message: "The semester is invalid." },
        { status: 400 },
      );
    }

    // If all checks pass, continue with the rest of the logic

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
      semester,
    });
    await paper.save();
    return NextResponse.json({ status: "success" }, { status: 201 });
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

async function CreatePDF(orderedFiles: File[]) {
  const pdfDoc = await PDFDocument.create();
  //sort files using name. Later remove to see if u can without names
  // moved to main function
  // const orderedFiles = Array.from(files).sort((a, b) => {
  //   return a.name.localeCompare(b.name);
  // });

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

//sets course-name to corresponding course name from our api
async function setTagsFromCurrentLists(
  tags: ExamDetail | undefined,
): Promise<ExamDetail> {
  const { data } = await axios.get<ICourses[]>(
    `${process.env.SERVER_URL}/api/course-list`,
  );
  const courses = data.map((course: { name: string }) => course.name);
  if (!courses[0] || !slots[0] || !exams[0] || !semesters[0] || !years[0]) {
    throw "Cannot fetch default value for courses/slot/exam/sem/year!";
  }

  const newTags: ExamDetail = {
    "course-name": courses[0],
    slot: slots[0],
    "course-code": "notInUse",
    "exam-type": exams[0],
    semester: semesters[0] as SemesterType,
    year: years[0],
  };
  const coursesFuzy = new Fuse(courses);
  if (!tags) {
    console.log("Anaylsis failed setting random courses as fields");
    return newTags;
  } else {
    const subjectSearch = coursesFuzy.search(
      tags["course-name"] + "|" + tags["course-code"],
    )[0];
    if (subjectSearch) {
      newTags["course-name"] = subjectSearch.item;
    }
    const slotSearchResult = findMatch(slots, tags.slot);
    if (slotSearchResult) {
      newTags.slot = slotSearchResult;
    }
    if ("exam-type" in tags && tags["exam-type"] in examMap) {
      const examType = tags["exam-type"] as keyof typeof examMap;
      newTags["exam-type"] = examMap[examType];
    }
    const semesterSearchResult = findMatch(semesters, tags.semester);
    if (semesterSearchResult) {
      newTags.semester = semesterSearchResult as SemesterType;
    }
    const yearSearchResult = findMatch(years, tags.year);
    if (yearSearchResult) {
      newTags.year = yearSearchResult;
    }
  }
  return newTags;
}
function findMatch<T>(arr: T[], value: string | undefined): T | undefined {
  if (!value) return undefined; // Handle undefined case
  const pattern = new RegExp(value, "i");
  return arr.find((item) => pattern.test(String(item)));
}
