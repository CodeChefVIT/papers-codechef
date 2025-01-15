"use client";
import React, { useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { handleAPIError } from "../../util/error";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { type PostPDFToCloudinary } from "@/interface";
import Dropzone from "react-dropzone";

import { createCanvas } from "canvas";
import { getDocument, GlobalWorkerOptions } from "pdfjs-dist";
import { PDFDocument } from "pdf-lib";
async function pdfToImage(file: File) {
  GlobalWorkerOptions.workerSrc =
    "https://unpkg.com/pdfjs-dist@3.4.120/build/pdf.worker.min.js";

  const pdfDoc = await PDFDocument.load(await file.arrayBuffer());

  // Get the first page
  const page = pdfDoc.getPages()[0];
  if (!page) {
    throw "First page not found";
  }
  // Create a canvas to render the image
  const canvas = createCanvas(page.getWidth(), page.getHeight());
  const context = canvas.getContext("2d");

  // Use pdfjs-dist to render the page
  const pdfjsDoc = await getDocument({ data: await file.arrayBuffer() })
    .promise;
  const pdfPage = await pdfjsDoc.getPage(1);

  // Render page to canvas
  const viewport = pdfPage.getViewport({ scale: 1 });
  await pdfPage.render({ canvasContext: context, viewport }).promise;

  // Convert the canvas to the desired output (Buffer, base64, etc.)
  return canvas.toDataURL(); // Returns a Base64 string
}

const Page = () => {
  const [campus, setCampus] = useState("Vellore");

  const [files, setFiles] = useState<File[]>([]);

  const [isUploading, setIsUploading] = useState(false);
  const [, setResetSearch] = useState(false);
  function fileCheckAndSelect<T extends File>(acceptedFiles: T[]) {
    const maxFileSize = 5 * 1024 * 1024;
    const allowedFileTypes = [
      "application/pdf",
      "image/jpeg",
      "image/png",
      "image/gif",
    ];

    const toastId = toast.loading("uploading your files");
    if (!acceptedFiles || acceptedFiles.length === 0) {
      toast.error("No files selected", {
        id: toastId,
      });
      return;
    }

    if (acceptedFiles.length > 5) {
      toast.error("More than 5 files selected", {
        id: toastId,
      });
      return;
    }

    // File validations
    const invalidFiles = acceptedFiles.filter(
      (file) =>
        file.size > maxFileSize || !allowedFileTypes.includes(file.type),
    );

    if (invalidFiles.length > 0) {
      toast.error(
        `Some files are invalid. Ensure each file is below 5MB and of an allowed type (PDF, JPEG, PNG, GIF).`,
        {
          id: toastId,
        },
      );
      return;
    }

    const isPdf =
      acceptedFiles.length === 1 &&
      acceptedFiles[0]?.type === "application/pdf";
    if (isPdf && acceptedFiles.length > 1) {
      toast.error("PDFs must be uploaded separately", {
        id: toastId,
      });
      return;
    }

    const orderedFiles = files.sort((a, b) => {
      return a.lastModified - b.lastModified;
    });
    setFiles(orderedFiles);
    toast.success(`${orderedFiles.length} files selected!`, {
      id: toastId,
    });
  }
  const handlePrint = async () => {
    if (!campus) {
      setCampus("Vellore");
    }

    const isPdf = files.length === 1 && files[0]?.type === "application/pdf";

    // Prepare FormData
    const formData = new FormData();
    files.forEach((file) => {
      formData.append("files", file);
    });

    if (isPdf && files[0]) {
      formData.append("image", await pdfToImage(files[0]));
    }
    // formData.append("exam", exam);
    formData.append("campus", campus);

    formData.append("isPdf", String(isPdf));

    setIsUploading(true);

    try {
      await toast.promise(
        axios.post<PostPDFToCloudinary>("/api/ai-upload", formData),
        {
          loading: "Uploading papers...",
          success: "Papers uploaded successfully!",
          error: "Failed to upload papers. Please try again.",
        },
      );

      // setSlot("");
      // setSubject("");
      // setExam("");
      // setYear("");
      setFiles([]);
      setResetSearch(true);
      setTimeout(() => setResetSearch(false), 100);
    } catch (error) {
      handleAPIError(error);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="flex h-screen flex-col justify-between">
      <div>
        <Navbar />
      </div>
      <div className="2xl:my-15 flex flex-col items-center">
        <fieldset className="mb-4 w-[350px] rounded-lg border-2 border-gray-300 p-4 pr-8">
          {/* <legend className="text-lg font-bold">Upload papers</legend> */}

          <div className="flex w-full flex-col 2xl:gap-y-4">
            {/* File Dropzone */}
            <div>
              <Dropzone onDrop={fileCheckAndSelect}>
                {({ getRootProps, getInputProps }) => (
                  <section className="my-2 -mr-2 cursor-pointer rounded-2xl border-2 border-dashed p-8 text-center">
                    <div {...getRootProps()}>
                      <input {...getInputProps()} />
                      <p>
                        Drag &apos;n&apos; drop some files here, or{" "}
                        <span className="text-[#6D28D9]">click</span> to select
                        files
                      </p>
                    </div>
                    <div
                      className={`mt-2 text-xs ${
                        files?.length === 0 ? "text-red-500" : "text-gray-600"
                      }`}
                    >
                      {files?.length || 0} files selected
                    </div>
                  </section>
                )}
              </Dropzone>
              <label className="mx-2 -mr-2 block text-center text-xs font-medium text-gray-700">
                Only Images and PDFs are allowed
                <sup className="text-red-500">*</sup>
              </label>
            </div>
          </div>
        </fieldset>
        <Button
          onClick={handlePrint}
          disabled={isUploading}
          className={`w-fit rounded-md px-4 py-3 ${isUploading ? "bg-gray-300" : ""}`}
        >
          {isUploading ? "Uploading..." : "Upload Papers"}
        </Button>
      </div>
      <div>
        <Footer />
      </div>
    </div>
  );
};

export default Page;
