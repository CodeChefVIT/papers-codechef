import { createFeedback } from "@/lib/services/feedback";
import { success } from "@/lib/utils/response";
import { customErrorHandler } from "@/lib/utils/error";

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as { message?: unknown; email?: unknown };
    const newFeedback = await createFeedback(body);

    return success(
      { message: "Feedback submitted successfully!", feedback: newFeedback },
      "Created",
      201,
    );
  } catch (error) {
    console.error("Error submitting feedback:", error);
    return customErrorHandler(error, "Failed to submit feedback.");
  }
}
