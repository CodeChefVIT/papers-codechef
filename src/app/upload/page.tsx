"use client";
import React, { useRef, useState } from "react";
import JSZip from "jszip";
import axios from "axios";
import { slots, courses } from "./select_options";
import toast, { Toaster } from "react-hot-toast";
import { handleAPIError } from "../../util/error";
import { useRouter } from "next/navigation";
import { type ApiError } from "next/dist/server/api-utils";
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
import {
  Command,
  CommandInput,
  CommandList,
  CommandItem,
  CommandEmpty,
  CommandGroup,
} from "@/components/ui/command";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const Page = () => {
  const router = useRouter();
  // const [openCamera, setOpenCamera] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [slot, setSlot] = useState("");
  const [subject, setSubject] = useState("");
  const [exam, setExam] = useState("");
  const [year, setYear] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [isSubjectCommandOpen, setIsSubjectCommandOpen] = useState(false);
  // const toggleOpenCamera = () => {
  //   setOpenCamera((prev) => !prev);
  // };

  // const handlePrint = async () => {
  //   // file validation
  //   const maxFileSize = 5 * 1024 * 1024;
  //   const files = fileInputRef.current?.files as FileList | null;
  //   if (!files || files.length == 0) {
  //     toast.error("No files selected");
  //     return;
  //   } else if (files.length > 5) {
  //     toast.error("More than 5 files selected");
  //     return;
  //   }
  //   for (const file of files) {
  //     if (file.size > maxFileSize) {
  //       toast.error(`File ${file.name} is more than 5MB`);
  //       return;
  //     }
  //   }
  //   const zip = new JSZip();
  //   const formData = new FormData();

  //   for (const file of files) {
  //     zip.file(file.name, file);
  //     const content = await zip.generateAsync({ type: "blob" });

  //     const arrayBuffer = await new Response(content).arrayBuffer();
  //     const uint8Array = new Uint8Array(arrayBuffer);

  //     formData.append("zipFile", new Blob([uint8Array]), "files.zip");
  //     formData.append("slot", slot);
  //     formData.append("subject", subject);
  //     formData.append("exam", exam);
  //     formData.append("year", year);
  //   }
  //   try {
  //     const result = await toast.promise(
  //       (async () => {
  //         try {
  //           const response = await axios.post<{ message: string }>(
  //             "/api/mail",
  //             formData,
  //             {
  //               headers: {
  //                 "Content-Type": "multipart/form-data",
  //               },
  //             },
  //           );
  //           return response.data;
  //         } catch (error) {
  //           handleAPIError(error);
  //         }
  //       })(),
  //       {
  //         loading: "Sending papers",
  //         success: "Papers successfully sent",
  //         error: (err: ApiError) => err.message,
  //       },
  //     );
  //     if (result?.message === "Email sent successfully!") {
  //       setTimeout(() => {
  //         router.push("/");
  //       }, 1500);
  //     }
  //   } catch (e) {
  //   }
  // };

  const handleSubjectSelect = (value: string) => {
    setSubject(value);
    setIsSubjectCommandOpen(false);
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
                    <SelectItem value="cat1">Cat 1</SelectItem>
                    <SelectItem value="cat2">Cat 2</SelectItem>
                    <SelectItem value="fat">Fat</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>

            {/* Subject Selection */}
            <div>
              <label>Subject:</label>
              {/* <div className="relative">
                <Button
                  type="button"
                  onClick={() => setIsSubjectCommandOpen((prev) => !prev)}
                  className="m-2 rounded-md border p-2"
                >
                  {subject || "Select subject"}
                </Button>
                {isSubjectCommandOpen && (
                  <Command className="absolute z-10 mt-2 w-full rounded-lg border shadow-md">
                    <CommandInput placeholder="Search subject..." />
                    <CommandList>
                      <CommandEmpty>No subjects found.</CommandEmpty>
                      <CommandGroup heading="Subjects">
                        {courses.map((course) => (
                          <CommandItem key={course} onSelect={() => handleSubjectSelect(course)}>
                            <span>{course}</span>
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                )}
              </div> */}
              <Command className="rounded-lg border shadow-md md:min-w-[450px]">
                <CommandInput placeholder="Type a subject or search..." />
                <CommandList className="h-[100px]">
                  <CommandEmpty>No results found.</CommandEmpty>

                  <CommandGroup heading="Subjects">
                    {courses.map((course) => (
                      <CommandItem
                        key={course}
                        onSelect={() => handleSubjectSelect(course)}
                      >
                        <span>{course}</span>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
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
                    {(() => {
                      const options = [];
                      for (
                        let i = 2011;
                        i <= Number(new Date().getFullYear());
                        i++
                      ) {
                        options.push(
                          <SelectItem key={i} value={String(i)}>
                            {i}
                          </SelectItem>,
                        );
                      }
                      return options;
                    })()}
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
                  onClick={() => fileInputRef.current?.click()} // Trigger file input on button click
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
        {/* <Button
          onClick={handlePrint}
          className="w-fit rounded-md px-4 py-3"
        >
          Upload Papers
        </Button> */}
      </div>
      <div className="">
        <Footer />
      </div>
    </div>
  );
};

export default Page;
