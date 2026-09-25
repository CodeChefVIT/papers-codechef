import { success, failure } from "@/lib/utils/response";
import { createPaperRequest } from "@/lib/services/paper";
import type { CreatePaperInputType } from "@/lib/services/paper";
import { getPostHogClient } from "@/lib/posthog-server";
import { randomUUID } from "crypto";

export async function POST(req: Request) {
  try {
    const {subject, exam, slot, year} = (await req.json()) as CreatePaperInputType

    if (!subject || !exam || !slot || !year) {
      return failure("All fields are required.", 400);
    }

    const newRequest = await createPaperRequest({subject, exam, slot, year});

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

    return success({ message: "Paper request submitted successfully!", request: newRequest }, "Created", 201);
  } catch (error) {
    console.error("Error creating paper request:", error);
    return failure("Failed to submit request.", 500);
  }
}
