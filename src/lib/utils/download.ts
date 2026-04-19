import { IPaper } from "../../interface";
import { extractBracketContent } from "./string";
import axios from "axios";

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
    console.error("Download failed:", error);
  }
};