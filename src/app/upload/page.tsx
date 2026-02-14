"use client";

import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import axios, { AxiosError } from "axios";
import { FiTrash, FiPlus } from "react-icons/fi";
import Image from "next/image";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  useSortable,
  horizontalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import Dropzone from "react-dropzone";
import { Upload, XIcon } from "lucide-react";
import { getDocument, GlobalWorkerOptions } from "pdfjs-dist";

GlobalWorkerOptions.workerSrc =
  "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.8.69/pdf.worker.min.mjs";

interface APIResponse {
  status: string;
  message?: string;
}

export default function Page() {
  const campus = "Vellore";
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<
    { id: string; file: File; preview: string }[]
  >([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isGlobalDragging, setIsGlobalDragging] = useState(false);
  const [zoomIndex, setZoomIndex] = useState<number | null>(null);

  useEffect(() => {
    const onDragEnter = () => setIsGlobalDragging(true);
    const onDragLeave = () => setIsGlobalDragging(false);
    const onDrop = () => setIsGlobalDragging(false);

    document.addEventListener("dragenter", onDragEnter);
    document.addEventListener("dragleave", onDragLeave);
    document.addEventListener("drop", onDrop);

    return () => {
      document.removeEventListener("dragenter", onDragEnter);
      document.removeEventListener("dragleave", onDragLeave);
      document.removeEventListener("drop", onDrop);
    };
  }, []);

  // Cleanup previews on unmount
  useEffect(() => {
    return () => {
      previews.forEach((item) => {
        try {
          URL.revokeObjectURL(item.preview);
        } catch {}
      });
    };
  }, []);

  const fileCheckAndSelect = useCallback(
    (acceptedFiles: File[]) => {
      const maxFileSize = 5 * 1024 * 1024;
      const allowedFileTypes = [
        "application/pdf",
        "image/jpeg",
        "image/png",
        "image/gif",
      ];

      const toastId = toast.loading("Adding your files...");
      if (!acceptedFiles || acceptedFiles.length === 0) {
        toast.error("No files selected", { id: toastId });
        return;
      }

      const isNewPdf = acceptedFiles.some(
        (file) => file.type === "application/pdf",
      );

      const hasExistingImages = files.some((file) =>
        file.type.startsWith("image/"),
      );

      const hasExistingPdf = files.some(
        (file) => file.type === "application/pdf",
      );

      if (isNewPdf && acceptedFiles.length > 1) {
        toast.error("Only one PDF can be uploaded at a time.", {
          id: toastId,
        });
        return;
      }

      if (isNewPdf && hasExistingImages) {
        toast.error("PDFs cannot be uploaded together with images.", {
          id: toastId,
        });
        return;
      }

      if (isNewPdf && hasExistingPdf) {
        toast.error("Only one PDF is allowed. You’ve already uploaded a PDF.", {
          id: toastId,
        });
        return;
      }

      if (!isNewPdf && hasExistingPdf) {
        toast.error(
          "Images cannot be uploaded after a PDF. Upload them separately.",
          {
            id: toastId,
          },
        );
        return;
      }

      const allFiles = [...files, ...acceptedFiles];
      if (allFiles.length > 5) {
        toast.error("You can upload up to 5 files only", { id: toastId });
        return;
      }

      const totalSize = allFiles.reduce(
        (sum, f) => sum + f.size,
        0,
      );
      if (totalSize > maxFileSize){
        toast.error("The total upload size exceeds 5MB.", { id: toastId });
        return;
      }

      const invalidFiles = acceptedFiles.filter(
        (file) =>
          file.size > maxFileSize || !allowedFileTypes.includes(file.type),
      );

      if (invalidFiles.length > 0) {
        toast.error(
          "Some files are invalid. Make sure the total size is below 5MB and files are of allowed types (PDF, JPEG, PNG, GIF).",
          { id: toastId },
        );
        return;
      }

      const newPreviews = acceptedFiles.map((file, idx) => ({
        id: `${file.name}-${file.lastModified}-${Date.now()}-${files.length + idx}`,
        file,
        preview: URL.createObjectURL(file),
      }));

      setFiles((prev) => [...prev, ...acceptedFiles]);
      setPreviews((prev) => [...prev, ...newPreviews]);

      toast.success(`${acceptedFiles.length} file(s) added!`, { id: toastId });
    },
    [files],
  );

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      fileCheckAndSelect(acceptedFiles);
    },
    [fileCheckAndSelect],
  );

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 200, tolerance: 10 },
    }),
  );

  function SortablePreview({
    id,
    children,
  }: {
    id: string;
    children: React.ReactNode;
  }) {
    const {
      attributes,
      listeners,
      setNodeRef,
      transform,
      transition,
      isDragging,
    } = useSortable({ id });

    const style = {
      transform: CSS.Transform.toString(transform),
      transition,
      zIndex: isDragging ? 1000 : 1,
      touchAction: "none",
    };

    return (
      <div
        ref={setNodeRef}
        style={style}
        {...attributes}
        {...listeners}
        className={isDragging ? "cursor-grabbing" : "cursor-grab"}
      >
        {children}
      </div>
    );
  }

  const handleDndKitDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = previews.findIndex((item) => item.id === active.id);
      const newIndex = previews.findIndex((item) => item.id === over.id);

      const newPreviews = arrayMove(previews, oldIndex, newIndex);
      const newFiles = arrayMove(files, oldIndex, newIndex);

      setFiles(newFiles);
      setPreviews(newPreviews);
    }
  };

  const handleDelete = (index: number) => {
    const deletedPreview = previews[index];
    if (deletedPreview) {
      URL.revokeObjectURL(deletedPreview.preview);
    }

    setFiles(files.filter((_, i) => i !== index));
    setPreviews(previews.filter((_, i) => i !== index));
  };

  const clearAllFiles = useCallback(() => {
    previews.forEach((item) => {
      try {
        URL.revokeObjectURL(item.preview);
      } catch {}
    });

    setFiles([]);
    setPreviews([]);
  }, [previews]);

  const handleUpload = async () => {
    const isPdf = files.length === 1 && files[0]?.type === "application/pdf";
    const formData = new FormData();

    files.forEach((file) => {
      formData.append("files", file);
    });
    formData.append("campus", campus);
    formData.append("isPdf", String(isPdf));

    setIsUploading(true);

    try {
      await toast.promise(
        async () => {
          try {
            await axios.post<APIResponse>("/api/upload", formData);
            return { message: "Papers uploaded successfully!" };
          } catch (error) {
            if (error instanceof AxiosError && error.response?.data) {
              const errorData = error.response.data as APIResponse;
              const errorMessage =
                errorData.message ?? "Failed to upload papers";
              throw new Error(errorMessage);
            }
            throw new Error("Failed to upload papers");
          }
        },
        {
          loading: "Uploading papers...",
          success: "Papers uploaded successfully!",
          error: (err: Error) => err.message,
        },
      );

      clearAllFiles();
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <main className="mx-auto max-w-3xl px-4 py-8">
      <div className="flex h-[calc(100vh-90px)] flex-col justify-center px-6 font-play">
        <div
          className={`2xl:my-15 flex ${previews.length === 0 ? "items-center" : ""} flex-col`}
        >
          {previews.length === 0 && (
            <fieldset className="mb-4 w-full max-w-md rounded-lg border-2 border-gray-300 p-4 pr-8">
              <div className="flex w-full flex-col 2xl:gap-y-4">
                <div>
                  <Dropzone
                    onDrop={onDrop}
                    accept={{
                      "image/*": [
                        ".jpeg",
                        ".jpg",
                        ".png",
                        ".gif",
                        ".bmp",
                        ".webp",
                      ],
                      "application/pdf": [".pdf"],
                    }}
                    multiple={true}
                  >
                    {({ getRootProps, getInputProps, isDragActive }) => (
                      <section
                        {...getRootProps()}
                        className={`my-2 -mr-2 cursor-pointer rounded-2xl border-2 ${
                          isDragActive || isGlobalDragging
                            ? "border-solid border-[#6D28D9] bg-purple-50 dark:bg-[#130E1F]"
                            : "border-dashed border-gray-300"
                        } touch-none p-8 text-center transition-all duration-200`}
                      >
                        <input {...getInputProps()} />
                        {isDragActive || isGlobalDragging ? (
                          <div className="flex flex-col items-center">
                            <p className="text-lg font-medium text-[#6D28D9]">
                              Drop files here
                            </p>
                            <Upload className="mt-2 h-10 w-10 animate-bounce text-[#6D28D9]" />
                          </div>
                        ) : (
                          <div>
                            Drag &apos;n&apos; drop some files here, or{" "}
                            <span className="text-[#6D28D9]">click</span> to
                            select files
                          </div>
                        )}
                        <div
                          className={`mt-2 text-xs ${
                            files.length === 0
                              ? "text-red-500"
                              : "text-gray-600"
                          }`}
                        >
                          {files.length} files selected
                        </div>
                        <div className="mt-4 text-sm text-gray-500">
                          Note: Uploaded papers are first reviewed by our team
                          before appearing on the website. If your paper
                          doesn&apos;t show up immediately, please be patient,
                          it&apos;s likely still under review.
                        </div>
                      </section>
                    )}
                  </Dropzone>
                  <label className="mx-2 -mr-2 block text-center text-xs font-medium text-gray-700">
                    Only Images and PDF are allowed
                    <sup className="text-red-500">*</sup>
                  </label>
                </div>
              </div>
            </fieldset>
          )}

          {previews.length > 0 && (
            <Dropzone
              onDrop={onDrop}
              accept={{
                "image/*": [".jpeg", ".jpg", ".png", ".gif", ".bmp", ".webp"],
                "application/pdf": [".pdf"],
              }}
              multiple={true}
            >
              {({ getRootProps, getInputProps, isDragActive }) => {
                const pdfUploaded = files.some(
                  (f) => f.type === "application/pdf",
                );
                return (
                  <div
                    className={`relative h-20 w-20 flex-shrink-0 touch-none group${
                      isDragActive || isGlobalDragging
                        ? "border-2 border-solid border-[#6D28D9]"
                        : ""
                    }`}
                    {...(!pdfUploaded ? getRootProps() : {})}
                  >
                    {!pdfUploaded && <input {...getInputProps()} />}
                    <div
                      className={`absolute left-4 top-4 h-16 w-16 rounded-2xl bg-[#A78BFA] dark:bg-violet-950 ${pdfUploaded ? "cursor-not-allowed text-gray-500" : "cursor-pointer text-white"}`}
                    />
                    <div className="absolute left-0 top-0 h-10 w-10 rounded-[20px] bg-[#A78BFA] dark:bg-violet-950" />

                    <div className="absolute left-1 top-1 flex h-8 w-8 items-center rounded-[20px] bg-black/30 dark:bg-black/50" />
                    <div
                      className={`absolute left-9 top-9 text-2xl ${pdfUploaded ? "cursor-not-allowed text-gray-500" : "cursor-pointer text-white"}`}
                    >
                      <div
                        className={`absolute text-2xl ${pdfUploaded ? "cursor-not-allowed text-gray-500" : "cursor-pointer text-white"}`}
                      >
                        <FiPlus className="h-7 w-7" />

                        {pdfUploaded && (
                          <div className="absolute left-12 top-1/2 -translate-y-1/2 whitespace-nowrap rounded-md bg-gradient-to-r from-indigo-900 to-violet-900 px-3 py-1 text-xs text-white opacity-0 shadow-lg transition-all duration-300 group-hover:translate-x-1 group-hover:opacity-100">
                            Only one PDF file is permitted.
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="absolute left-4 top-3 text-xs font-semibold text-white">
                      {previews.length}
                    </div>
                  </div>
                );
              }}
            </Dropzone>
          )}
          {previews.length > 0 && (
            <section className="mt-6 flex w-full flex-col items-center">
              <div className="flex w-max gap-4">
                <div className="scrollbar-hide flex w-[80vw] max-w-4xl flex-col justify-between overflow-x-auto overflow-y-hidden rounded-[40px] border-[6px] border-[#A78BFA] bg-indigo-900/10 p-4 dark:border-indigo-900 sm:p-6 md:w-max md:p-8">
                  <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handleDndKitDragEnd}
                  >
                    <SortableContext
                      items={previews.map((item) => item.id)}
                      strategy={horizontalListSortingStrategy}
                    >
                      <div className="flex w-full snap-x snap-mandatory gap-3 sm:gap-4 md:gap-5">
                        {previews.map((item, index) => (
                          <SortablePreview key={item.id} id={item.id}>
                            <div className="group relative w-full flex-shrink-0 snap-start sm:w-1/2 md:w-1/3 lg:w-1/4">
                              <div className="relative h-64 w-48 overflow-hidden rounded-xl outline outline-2 outline-white sm:h-60">
                                {/* Index badge */}
                                <div className="absolute left-0 top-0 z-20 flex h-8 w-8 items-center justify-center rounded-br-xl rounded-tl-xl bg-slate-600 sm:h-10 sm:w-10">
                                  <span className="text-sm font-bold text-white sm:text-xl">
                                    {index + 1}
                                  </span>
                                </div>

                                {/* Delete button */}
                                <Button
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    handleDelete(index);
                                  }}
                                  variant="destructive"
                                  size="icon"
                                  className="absolute right-0 top-0 z-20 h-8 w-8 rounded-bl-xl rounded-tr-xl bg-pink-800 hover:bg-red-900 sm:h-10 sm:w-10"
                                  title="Delete"
                                >
                                  <FiTrash className="h-4 w-4 sm:h-5 sm:w-5" />
                                </Button>

                                {/* Preview */}
                                <div className="absolute inset-0 z-10">
                                  {item.file.type.startsWith("image/") ? (
                                    <Image
                                      src={item.preview}
                                      alt={`Page ${index + 1}`}
                                      fill
                                      className="object-cover"
                                      unoptimized
                                    />
                                  ) : (
                                    <iframe
                                      src={item.preview}
                                      title={`PDF preview ${index + 1}`}
                                      className="h-full w-full border-0"
                                    />
                                  )}
                                </div>
                              </div>
                            </div>
                          </SortablePreview>
                        ))}
                      </div>

                      {previews.length > 2 && (
                        <div className="mt-3 text-center text-sm text-white/50">
                          Swipe to view more &gt;&gt;
                        </div>
                      )}
                    </SortableContext>
                  </DndContext>
                </div>
              </div>
              {previews.length > 1 && (
                <div className="mt-4 text-right text-xl text-white/50">
                  Drag to reorder
                </div>
              )}
            </section>
          )}

          <Button
            onClick={handleUpload}
            disabled={isUploading || files.length === 0}
            className="mt-8 rounded-[40px] bg-[#A78BFA] px-8 py-3 text-xl text-white hover:bg-[#8B5CF6] dark:bg-violet-950 dark:hover:bg-violet-800"
          >
            {isUploading ? "Uploading..." : "Upload"}
          </Button>
        </div>
      </div>

      {zoomIndex !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70">
          <div className="relative flex flex-col items-center rounded-lg bg-white p-4 shadow-lg">
            <Button
              onClick={() => setZoomIndex(null)}
              variant="ghost"
              size="icon"
              className="absolute right-2 top-2 rounded-full bg-gray-200 hover:bg-gray-300"
              title="Close"
            >
              <XIcon className="h-6 w-6" />
            </Button>
            {previews[zoomIndex]?.file.type.startsWith("image/") ? (
              <Image
                src={previews[zoomIndex].preview}
                alt="zoomed preview"
                className="max-h-[80vh] max-w-[80vw] rounded-md"
                width={800}
                height={600}
                unoptimized
              />
            ) : previews[zoomIndex] ? (
              <iframe
                src={previews[zoomIndex].preview}
                className="h-[80vh] w-[80vw] rounded-md border"
                title={`PDF zoom preview ${zoomIndex}`}
              />
            ) : null}
            {previews[zoomIndex] && (
              <p className="mt-4 break-words text-center font-semibold text-[#6D28D9]">
                {previews[zoomIndex].file.name}
              </p>
            )}
          </div>
        </div>
      )}
    </main>
  );
}
