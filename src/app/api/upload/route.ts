import { success, failure } from "@/lib/utils/response";
import { uploadPaper } from "@/lib/services/upload";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const files = formData.getAll("files").filter(Boolean) as File[];
    const isPdf = formData.get("isPdf") === "true";
    const thumbnail = formData.get("thumbnail") as File | null;
    const campus = formData.get("campus") as string | null;

    if (files.length === 0) {
      return failure("No files received.", 400);
    }

    const result = await uploadPaper({ files, isPdf, thumbnail, campus });

    if (!result.success) {
      return failure(result.message, result.status);
    }

    return success(
      { file_url: result.file_url, thumbnail_url: result.thumbnail_url },
      "Created",
      201,
    );
  } catch (error) {
    console.error(error);
    return failure("Failed to upload papers", 500);
  }
}