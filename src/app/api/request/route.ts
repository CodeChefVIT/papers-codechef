import { z } from "zod";
import { success, failure } from "@/lib/utils/response";
import { createPaperRequest } from "@/lib/services/paper";
import { requestExams } from "@/db/paperRequest";
import { getPostHogClient } from "@/lib/posthog-server";
import { randomUUID } from "crypto";

const paperRequestInput = z.object({
  subject: z.string().trim().min(1).max(200),
  exam: z.enum(requestExams),
  slot: z.string().trim().min(1).max(20),
  year: z.string().trim().min(1).max(20),
});

export async function POST(req: Request) {
  try {
    const body: unknown = await req.json().catch(() => null);
    const input = paperRequestInput.safeParse(body);

    if (!input.success) {
      return failure(
        `send a subject, slot and year, and one of ${requestExams.join(", ")} as exam`,
        400,
      );
    }

    const { subject, exam, slot, year } = input.data;
    const { request, alreadyRequested } = await createPaperRequest({ subject, exam, slot, year });

    if (alreadyRequested) {
      return success({ message: "this paper has already been requested", request });
    }

    try {
      const posthog = getPostHogClient();
      if (posthog) {
        posthog.capture({
          distinctId: randomUUID(),
          event: "paper_request_created",
          properties: {
            exam,
            slot,
            year,
          },
        });
        await posthog.flush();
      }
    } catch (analyticsError) {
      console.error("[REQUEST_ANALYTICS_ERROR]", {
        name:
          analyticsError instanceof Error ? analyticsError.name : "UnknownError",
        message:
          analyticsError instanceof Error
            ? analyticsError.message
            : String(analyticsError),
        stack:
          analyticsError instanceof Error ? analyticsError.stack : undefined,
      });
    }

    return success(
      { message: "Paper request submitted successfully!", request },
      "Created",
      201,
    );
  } catch (error) {
    console.error("[REQUEST_ROUTE_ERROR]", {
      name: error instanceof Error ? error.name : "UnknownError",
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });
    return failure("Failed to submit request.", 500);
  }
}
