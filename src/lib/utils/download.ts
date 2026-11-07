import { type IPaper } from "../../interface";
import { extractBracketContent } from "./string";
import axios from "axios";
import toast from "react-hot-toast";

export const getSecureUrl = (url: string): string =>
  url.startsWith("http://") ? url.replace("http://", "https://") : url;

export const generateFileName = (paper: IPaper): string => {
  const extension = paper.file_url.split(".").pop();
  return `${extractBracketContent(paper.subject)}-${paper.exam}-${paper.slot}-${paper.year}.${extension}`;
};

export const downloadFile = async (
  url: string,
  filename: string,
): Promise<void> => {
  try {
    const response = await axios.get(url, { responseType: "blob" });
    const blob = new Blob([response.data]);
    const link = document.createElement("a");
    link.href = window.URL.createObjectURL(blob);
    link.download = filename;
    link.click();
    window.URL.revokeObjectURL(link.href);
  } catch (error) {
    console.error("Download failed (File missing or network error):", error);
    if (typeof navigator !== "undefined" && !navigator.onLine) {
      toast.error("You are offline. Please check your internet connection.");
    } else {
      toast.error("This paper is no longer available on the server.");
    }
  }
};