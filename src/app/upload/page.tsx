"use client";

import React, { useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { handleAPIError } from "../../util/error";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { type PostPDFToCloudinary } from "@/interface";
import { slots, years, campuses, semesters, exams } from "@/components/select_options";
import SearchBar from "@/components/searchbarSubjectList";
import Dropzone from "react-dropzone";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const Page = () => {
  const [slot, setSlot] = useState("");
  const [subject, setSubject] = useState("");
  const [exam, setExam] = useState("");
  const [year, setYear] = useState("");
  const [campus, setCampus] = useState("Vellore");
  const [semester, setSemester] = useState("");
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
  const [files, setFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [resetSearch, setResetSearch] = useState(false);

  const handlePrint = async () => {
    const maxFileSize = 5 * 1024 * 1024;
    const allowedFileTypes = [
      "application/pdf",
      "image/jpeg",
      "image/png",
      "image/gif",
    ];

    if (!slot) {
      toast.error("Slot is required");
      return;
    }
    if (!subject) {
      toast.error("Subject is required");
      return;
    }
    if (!exam) {
      toast.error("Exam is required");
      return;
    }
    if (!year) {
      toast.error("Year is required");
      return;
    }
    if (!campus) {
      setCampus("Vellore");
    }

    if (!semester) {
      toast.error("Semester is required");
      return;
    }
    if (!files || files.length === 0) {
      toast.error("No files selected");
      return;
    }

    if (files.length > 5) {
      toast.error("More than 5 files selected");
      return;
    }

    // File validations
    const invalidFiles = files.filter(
      (file) =>
        file.size > maxFileSize || !allowedFileTypes.includes(file.type),
    );

    if (invalidFiles.length > 0) {
      toast.error(
        `Some files are invalid. Ensure each file is below 5MB and of an allowed type (PDF, JPEG, PNG, GIF).`,
      );
      return;
    }

    const isPdf = files.length === 1 && files[0]?.type === "application/pdf";
    if (isPdf && files.length > 1) {
      toast.error("PDFs must be uploaded separately");
      return;
    }

    // Prepare FormData
    const formData = new FormData();
    files.forEach((file) => {
      formData.append("files", file);
    });
    formData.append("subject", subject);
    formData.append("slot", slot);
    formData.append("year", year);
    formData.append("exam", exam);
    formData.append("semester", semester);
    formData.append("campus", campus);

    formData.append("isPdf", String(isPdf));

    setIsUploading(true);

    try {
      await toast.promise(
        axios.post<PostPDFToCloudinary>("/api/upload", formData),
        {
          loading: "Uploading papers...",
          success: "Papers uploaded successfully!",
          error: "Failed to upload papers. Please try again.",
        },
      );

      setSlot("");
      setSubject("");
      setExam("");
      setYear("");
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
          <legend className="text-lg font-bold">Select paper parameters</legend>

          <div className="flex w-full flex-col 2xl:gap-y-4">
            {/* Slot Selection */}
            <div>
              <label>Slot:</label>
              <Select value={slot} onValueChange={setSlot}>
                <SelectTrigger className="m-2 rounded-md border p-2">
                  <SelectValue placeholder="Select slot" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Slots</SelectLabel>
                    {slots.map((slot) => (
                      <SelectItem key={slot} value={slot}>
                        {slot}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>

            {/* Exam Selection */}
            <div>
              <label>Exam:</label>
              <Select value={exam} onValueChange={setExam}>
                <SelectTrigger className="m-2 rounded-md border p-2">
                  <SelectValue placeholder="Select exam" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Exams</SelectLabel>
                    {exams.map((exam) => (
                      <SelectItem key={exam} value={String(exam)}>
                        {exam}
                      </SelectItem>
                    ))}{" "}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>

            {/* Subject Selection */}
            <div>
              <label>Subject:</label>
              <SearchBar setSubject={setSubject} resetSearch={resetSearch} />
            </div>

            {/* Year Selection */}
            <div>
              <label>Year:</label>
              <Select value={year} onValueChange={setYear}>
                <SelectTrigger className="m-2 rounded-md border p-2">
                  <SelectValue placeholder="Select year" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Years</SelectLabel>
                    {years.map((year) => (
                      <SelectItem key={year} value={String(year)}>
                        {year}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>

            {/* Year Selection */}

            <div>
              <label>Semester Selection:</label>
              <Select value={semester} onValueChange={setSemester}>
                <SelectTrigger className="m-2 rounded-md border p-2">
                  <SelectValue placeholder="Select semester" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Semester</SelectLabel>
                    {semesters.map((semester) => (
                      <SelectItem key={semester} value={String(semester)}>
                        {semester}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>

            {/* File Dropzone */}
            <div>
              <Dropzone
                onDrop={(acceptedFiles) => setFiles(acceptedFiles)}
                accept={{ "image/*": [], "application/pdf": [] }}
              >
                {({ getRootProps, getInputProps }) => (
                  <section className="my-2 -mr-2 rounded-2xl border-2 border-dashed p-8 text-center">
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