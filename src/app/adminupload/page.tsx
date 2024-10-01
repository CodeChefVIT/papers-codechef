"use client";
import React, { useState, useEffect } from "react";
import axios, { AxiosError } from "axios";
import { CldUploadWidget } from "next-cloudinary";
import {
  type CloudinaryUploadWidgetProps,
  type CloudinaryUploadResult,
} from "@/interface";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Trash } from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";

interface PostPDF {
  url: string;
}
interface DeletePDF {
  message: string;
}

interface PostPDFToCloudinary {
  status: boolean;
}

const Upload: React.FC = () => {
  const router = useRouter();
  const [subject, setSubject] = useState<string>("");
  const [slot, setSlot] = useState<string>("");
  const [year, setYear] = useState<string>("");
  const [exam, setExam] = useState<string>("cat1");
  const [tag, setTag] = useState<string>();
  const [urls, setUrls] = useState<string[]>();
  const [publicIds, setPublicIds] = useState<string[]>();
  const [isPdf, setIsPdf] = useState<boolean>(false);
  const [asset, setAsset] =
    useState<(CloudinaryUploadResult | string | undefined)[]>();
  const [file, setFile] = useState<File | undefined>();
  const [error, setError] = useState<string | null>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);

  useEffect(() => {
    async function makeTage() {
      const token = localStorage.getItem("token");
      const headers = {
        Authorization: `Bearer ${token}`,
      };
      if (!token) {
        console.error("Token not found in localStorage.");
        router.push("/papersadminlogin");
      }
      try {
        const response = await axios.get("/api/admin/dashboard", { headers });
        const timestamp = Date.now();
        setTag(`papers-${timestamp}`);
      } catch (error: unknown) {
        if (error instanceof AxiosError) {
          const status = error.response?.status;
          if (status === 401) {
            router.push("/papersadminlogin");
          } else {
            toast.error("An unknown error occurred");
          }
        } else {
          toast.error("An unexpected error occurred");
        }
      }
    }
    void makeTage();
  }, []);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setFile(event.target.files[0]);
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const token = localStorage.getItem("token");
    if (!token) {
      console.error("Token not found in localStorage.");
      router.push("/papersadminlogin");
      return;
    }
    const headers = {
      Authorization: `Bearer ${token}`,
    };
    if (!file) {
      setError("Please select a PDF file to upload.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      await axios.post("/api/admin/watermark", formData, { headers });
    } catch (error: unknown) {
      if (error instanceof AxiosError) {
        const status = error.response?.status;
        if (status === 401) {
          router.push("/papersadminlogin");
        } else {
          toast.error("Failed to upload papers.");
          setError("Failed to watermark PDF.");
        }
      } else {
        toast.error("An unexpected error occurred");
        setError("Failed to watermark PDF.");
      }
    }
  };

  const handleDelete = async (
    public_id: string,
    type: string,
    delUrl: string,
  ) => {
    const token = localStorage.getItem("token");
    if (!token) {
      console.error("Token not found in localStorage.");
      router.push("/papersadminlogin");
      return;
    }
    const headers = {
      Authorization: `Bearer ${token}`,
    };
    try {
      const response = await axios.delete(`/api/admin`, {
        params: { public_id, type },
        headers,
      });

      const updatedUrls = urls?.filter((url) => url !== delUrl);
      setUrls(updatedUrls);
      const updatePublicIds = publicIds?.filter((id) => id !== public_id);
      setPublicIds(updatePublicIds);
      const updatedAssets = asset?.filter((asset) => {
        if (typeof asset === "string") {
          return true;
        }
        return asset?.public_id !== public_id;
      });
      setAsset(updatedAssets);
    } catch (error: unknown) {
      if (error instanceof AxiosError) {
        const status = error.response?.status;
        if (status === 401) {
          router.push("/papersadminlogin");
        } else {
          toast.error("Failed to upload papers.");
        }
      } else {
        toast.error("An unexpected error occurred");
      }
    }
  };

  const handleDeletePdf = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      console.error("Token not found in localStorage.");
      router.push("/papersadminlogin");
      return;
    }
    const headers = {
      Authorization: `Bearer ${token}`,
    };
    try {
      const response = await axios.delete("/api/admin/watermark", { headers });
    } catch (error: unknown) {
      if (error instanceof AxiosError) {
        const status = error.response?.status;
        if (status === 401) {
          router.push("/papersadminlogin");
        } else {
          toast.error("Failed to upload papers.");
          setError("Failed to delete PDF.");
        }
      } else {
        toast.error("An unexpected error occurred");
        setError("An unexpected error occurred.");
      }
    }
  };

  const handleFileChangeMerged = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files ?? []);
    setFiles(selectedFiles);
  };

  const handleSubmitMerged = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log(files);
    if (files.length === 0) {
      alert("Please upload at least one file");
      return;
    }

    const formData = new FormData();
    files.forEach((file) => {
      formData.append("files", file);
    });

    try {
      const response = await axios.post<PostPDF>(
        "/api/admin/imgtopdf",
        formData,
      );
      setPdfUrl(response.data.url);
    } catch (error: unknown) {
      if (error instanceof AxiosError) {
        const status = error.response?.status;
        if (status === 401) {
          router.push("/papersadminlogin");
        } else {
          toast.error("Failed to upload papers.");
        }
      } else {
        toast.error("An unexpected error occurred");
      }
    }
  };

  const handleDeleteMerged = async () => {
    if (!pdfUrl) return;

    try {
      const response = await axios.delete<DeletePDF>("/api/admin/imgtopdf", {
        data: { filePath: pdfUrl },
      });
      alert(response.data.message);
      setPdfUrl(null);
    } catch (error: unknown) {
      if (error instanceof AxiosError) {
        const status = error.response?.status;
        if (status === 401) {
          router.push("/papersadminlogin");
        } else {
          toast.error("Failed to upload papers.");
        }
      } else {
        toast.error("An unexpected error occurred");
      }
    }
  };

  async function completeUpload() {
    const token = localStorage.getItem("token");
    if (!token) {
      console.error("Token not found in localStorage.");
      router.push("/papersadminlogin");
      return;
    }
    const headers = {
      Authorization: `Bearer ${token}`,
    };
    const body = {
      publicIds: publicIds,
      urls: urls,
      subject: subject,
      slot: slot,
      year: year,
      exam: exam,
      isPdf: isPdf,
    };
    try {
      const response = await axios.post<PostPDFToCloudinary>(
        "/api/admin",
        body,
        { headers },
      );
      if (response.data.status) {
        setUrls([]);
        setSubject("");
        setSlot("");
        setYear("");
        setExam("cat1");
        setAsset([]);
        setPublicIds([]);
        setUrls([]);
      }
    } catch (error: unknown) {
      if (error instanceof AxiosError) {
        const status = error.response?.status;
        if (status === 401) {
          router.push("/papersadminlogin");
        } else {
          toast.error("Failed to upload papers.");
        }
      } else {
        toast.error("An unexpected error occurred");
      }
    }
  }

  if (!tag) {
    return <div>Loading...</div>;
  }

  return (
    <div className="mx-auto p-6 md:flex md:w-[100%] md:gap-x-16">
      <div className="md:w-[35%]">
        <h1 className="mb-6 text-2xl font-bold">Upload Papers</h1>
        <CldUploadWidget
          uploadPreset="papers-unsigned"
          options={{
            sources: ["camera", "local"],
            multiple: false,
            cropping: true,
            singleUploadAutoClose: false,
            maxFiles: 5,
            tags: [tag],
          }}
          //@ts-expect-error - event is not used
          onSuccess={(results: CloudinaryUploadWidgetProps) => {
            setUrls((prevUrls) => [...(prevUrls ?? []), results.info?.url]);
            setPublicIds((prevIds) => [
              ...(prevIds ?? []),
              results.info?.public_id,
            ]);
            setAsset((prevAssets) => [...(prevAssets ?? []), results.info]);
          }}
        >
          {({ open }) => (
            <button
              className="mb-4 rounded bg-indigo-500 px-4 py-2 text-white hover:bg-indigo-600"
              onClick={() => open()}
            >
              Upload Files
            </button>
          )}
        </CldUploadWidget>
        <div className="mb-4">
          <label className="block text-gray-700">Subject:</label>
          <input
            type="text"
            className="w-full rounded border px-3 py-2"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700">Slot:</label>
          <input
            type="text"
            className="w-full rounded border px-3 py-2"
            value={slot}
            onChange={(e) => setSlot(e.target.value)}
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700">Year:</label>
          <input
            type="text"
            className="w-full rounded border px-3 py-2"
            value={year}
            onChange={(e) => setYear(e.target.value)}
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700">Exam:</label>
          <select
            className="w-full rounded border bg-white px-3 py-2"
            value={exam}
            onChange={(e) => setExam(e.target.value)}
          >
            <option value="cat1">CAT1</option>
            <option value="cat2">CAT2</option>
            <option value="fat">FAT</option>
          </select>
        </div>
        <div className="mb-4">
          <label className="block text-gray-700">Is PDF:</label>
          <input
            type="checkbox"
            className="mr-2 leading-tight"
            checked={isPdf}
            onChange={(e) => setIsPdf(e.target.checked)}
          />
        </div>
        <button
          className="mr-2 rounded bg-green-500 px-4 py-2 text-white hover:bg-green-600"
          onClick={completeUpload}
        >
          Complete Upload
        </button>
        <div>
          <div className="mt-8 max-w-md rounded-lg border p-6 shadow-lg">
            <h1 className="mb-4 text-2xl font-bold">
              Upload and Watermark PDF
            </h1>
            {error && <p className="mb-4 text-red-500">{error}</p>}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="fileInput" className="mb-1 block">
                  Select PDF file to upload:
                </label>
                <input
                  id="fileInput"
                  type="file"
                  accept=".pdf"
                  onChange={handleFileChange}
                  className="w-full rounded border border-gray-300 px-3 py-2"
                />
              </div>
              <button
                type="submit"
                className="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
              >
                Upload and Watermark PDF
              </button>
            </form>
            <div className="mt-4">
              <Link
                href="/watermarked.pdf"
                target="_blank"
                className="block text-blue-500 hover:underline"
              >
                View Papers
              </Link>
              <button
                onClick={handleDeletePdf}
                className="mt-2 rounded bg-red-500 px-4 py-2 text-white hover:bg-red-600"
              >
                Delete PDF
              </button>
            </div>
          </div>
        </div>
        <div className="flex">
          <div className="w-full max-w-md rounded bg-white p-8 shadow-md">
            <h1 className="mb-6 text-2xl font-bold">
              Upload Images to Convert to PDF
            </h1>
            <form onSubmit={handleSubmitMerged}>
              <div className="mb-4">
                <label className="mb-2 block font-semibold text-gray-700">
                  Images:
                </label>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleFileChangeMerged}
                  className="block w-full cursor-pointer rounded-lg border border-gray-300 bg-gray-50 text-sm text-gray-900 focus:outline-none"
                />
              </div>
              <button
                type="submit"
                className="w-full rounded bg-blue-500 px-4 py-2 font-semibold text-white hover:bg-blue-600"
              >
                Convert to PDF
              </button>
            </form>
            {pdfUrl && (
              <div className="mt-6 text-center">
                <h2 className="mb-2 text-xl font-semibold">PDF Created</h2>
                <a
                  href={pdfUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mb-4 inline-block text-blue-500 hover:text-blue-600"
                >
                  Download PDF
                </a>
                <button
                  onClick={handleDeleteMerged}
                  className="w-full rounded bg-red-500 px-4 py-2 font-semibold text-white hover:bg-red-600"
                >
                  Delete PDF
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="mt-6 w-[65%]">
        <h2 className="mb-4 text-xl font-semibold">Uploaded Assets:</h2>
        {asset && asset.length > 0 ? (
          <div className="flex h-full gap-4">
            {asset.map((asset, index) => (
              <div key={index} className="relative w-full flex-wrap">
                {typeof asset !== "string" &&
                typeof asset?.url === "string" &&
                asset.url.toLowerCase().endsWith(".pdf") ? (
                  <div className="relative h-full hover:brightness-50">
                    <iframe
                      src={asset.url}
                      className="h-full w-full"
                      title={`Uploaded PDF ${index + 1}`}
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Trash
                        color="#ed333b"
                        className="z-[100] cursor-pointer hover:brightness-200"
                        onClick={() =>
                          handleDelete(asset.public_id, asset.type, asset.url)
                        }
                      />
                    </div>
                  </div>
                ) : (
                  <div className="relative h-72 w-full">
                    {typeof asset !== "string" &&
                      typeof asset?.url === "string" && (
                        <div className="relative h-full w-full">
                          <div className="relative h-full w-full">
                            <Image
                              src={asset.url}
                              alt={`Uploaded image ${index + 1}`}
                              layout="fill"
                              objectFit="cover"
                              className="rounded-lg hover:brightness-50"
                            />
                          </div>
                          <div className="absolute right-2 top-2">
                            <Trash
                              color="#ed333b"
                              className="cursor-pointer"
                              onClick={() =>
                                handleDelete(
                                  asset.public_id,
                                  asset.type,
                                  asset.url,
                                )
                              }
                            />
                          </div>
                        </div>
                      )}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p>No files uploaded yet.</p>
        )}
      </div>
    </div>
  );
};

export default Upload;