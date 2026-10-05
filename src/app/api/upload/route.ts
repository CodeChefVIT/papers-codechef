import { success, failure } from "@/lib/utils/response";
import { uploadPaper } from "@/lib/services/upload";
import { getPostHogClient } from "@/lib/posthog-server";
import { randomUUID } from "crypto";

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

    try {
      const posthog = getPostHogClient();

      if (posthog) {
        posthog.capture({
          distinctId: randomUUID(),
          event: "paper_upload_completed",
          properties: {
            file_count: files.length,
            is_pdf: isPdf,
            campus: campus ?? "unknown",
          },
        });

        await posthog.flush();
      }
    } catch (analyticsError) {
      console.error("[UPLOAD_ANALYTICS_ERROR]", {
        name:
          analyticsError instanceof Error
            ? analyticsError.name
            : "UnknownError",
        message:
          analyticsError instanceof Error
            ? analyticsError.message
            : String(analyticsError),
        stack:
          analyticsError instanceof Error ? analyticsError.stack : undefined,
      });
    }

    return success(
      { file_url: result.file_url, thumbnail_url: result.thumbnail_url },
      "Created",
      201,
    );
  } catch (error) {
    console.error("[UPLOAD_ROUTE_ERROR]", {
      name: error instanceof Error ? error.name : "UnknownError",
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });
    return failure("Failed to upload papers", 500);
  }
}