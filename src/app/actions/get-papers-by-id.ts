// "use server";
import {  type PaperResponse } from "@/interface";
import axios, { type AxiosResponse } from "axios";

export const fetchPaperID = async (id: string): Promise<PaperResponse> => {
  const serverUrl = process.env.SERVER_URL ?? "https://papers.codechefvit.com";

  try {
    const response: AxiosResponse<PaperResponse> = await axios.get(
      `${serverUrl}/api/paper-by-id/${id}`
    );
    return response.data;
  } catch (err: unknown) {
    if (axios.isAxiosError(err)) {
      console.error("Axios error:", err.response?.data || err.message);
      const errorMessage = (err.response?.data as { message?: string })?.message ?? "Failed to fetch paper";
      throw new Error(errorMessage);
    } else {
      console.error("Unexpected error:", err);
      throw new Error("An unexpected error occurred");
    }
  }
};
