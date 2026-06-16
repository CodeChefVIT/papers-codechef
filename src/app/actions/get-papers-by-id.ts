import type { PaperResponse, ApiResponse } from "@/interface";
import axios, { type AxiosResponse } from "axios";

export const fetchPaperID = async (id: string): Promise<PaperResponse> => {
  const serverUrl = process.env.SERVER_URL ?? "https://papers.codechefvit.com";

  try {
    const response: AxiosResponse<ApiResponse<PaperResponse>> = await axios.get(
      `${serverUrl}/api/paper-by-id/${id}`,
    );

    if (!response.data.data) {
      throw new Error("Paper not found");
    }
    return response.data.data;
  } catch (err: unknown) {
    if (axios.isAxiosError<ApiResponse<unknown>>(err)) {
      const errorMessage = err.response?.data?.message ?? err.message;
      console.error("Axios error:", errorMessage);
      throw new Error(errorMessage);
    } else {
      console.error("Unexpected error:", err);
      throw new Error("An unexpected error occurred");
    }
  }
};
