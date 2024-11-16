"use client";

import React, { useRef, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { handleAPIError } from "../../util/error";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectGroup,
  SelectLabel,
  SelectItem,
} from "@/components/ui/select";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { courses, slots, years } from "@/components/select_options";
import SearchBar from "@/components/searchbarSubjectList";

const Page = () => {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [slot, setSlot] = useState("");
  const [subject, setSubject] = useState("");
  const [exam, setExam] = useState("");
  const [year, setYear] = useState("");
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
    const files = fileInputRef.current?.files as FileList | null;

    if (!slot || !subject || !exam || !year || !files || files.length === 0) {
      toast.error("All fields are required.");
      return;
    }

    if (files.length > 5) {
      toast.error("More than 5 files selected");
      return;
    }

    if (!Array.from(files).every((file) => file.type === files[0]?.type)) {
      toast.error(`All files MUST be of the same type`);
      return;
    }

    for (const file of files) {
      if (file.size > maxFileSize) {
        toast.error(`File ${file.name} is more than 5MB`);
        return;
      }
      if (!allowedFileTypes.includes(file.type)) {
        toast.error(
          `File type of ${file.name} is not allowed. Only PDFs and images are accepted.`,
        );
        return;
      }
    }

    let isPdf = false;
    if (files[0]?.type === "application/pdf") {
      isPdf = true;
      if (files.length > 1) {
        toast.error(`PDFs should be uploaded separately`);
        return;
      }
    }

    const Arrfiles = Array.from(files);
    const formData = new FormData();
    Arrfiles.forEach((file) => {
      formData.append("files", file);
    });
    formData.append("subject", subject);
    formData.append("slot", slot);
    formData.append("year", year);
    formData.append("exam", exam);
    formData.append("isPdf", String(isPdf));

    setIsUploading(true);

    try {
      await toast.promise(axios.post("/api/upload", formData), {
        loading: "Uploading papers...",
        success: "Papers uploaded",
        error: (err) => err.message,
      });

      setSlot("");
      setSubject("");
      setExam("");
      setYear("");
      setFiles([]); //gpt ko nahi ata hoga par merko ata hai.koi nahi
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

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
                    <SelectItem value="CAT-1">CAT-1</SelectItem>
                    <SelectItem value="CAT-2">CAT-2</SelectItem>
                    <SelectItem value="FAT">FAT</SelectItem>
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

            <div className="m-4 flex items-center">
              <Input
                required
                type="file"
                accept="image/*,.pdf"
                multiple
                ref={fileInputRef}
                className="hidden"
                onChange={(e) => {
                  const filesArray = Array.from(e.target.files ?? []);
                  setFiles(filesArray);
                }}
              />
              <div>
                <Button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="rounded-md px-4 py-2 transition"
                >
                  Choose files
                </Button>
                <div
                  className={`ml-2 mt-1 text-xs ${files.length === 0 ? "text-red-500" : ""}`}
                >
                  {files.length} files selected
                </div>
              </div>
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