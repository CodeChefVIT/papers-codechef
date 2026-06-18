import { success, failure } from "@/lib/utils/response";
import { createPaperRequest } from "@/lib/services/paper"

export async function POST(req: Request) {
  try {
    const {subject, exam, slot, year} = await req.json()

    if (!subject || !exam || !slot || !year) {
      return failure("All fields are required.", 400);
    }

    const newRequest = createPaperRequest({subject, exam, slot, year});
    return success({ message: "Paper request submitted successfully!", request: newRequest }, "Created", 201);
  } catch (error) {
    console.error("Error creating paper request:", error);
    return failure("Failed to submit request.", 500);
  }
}
