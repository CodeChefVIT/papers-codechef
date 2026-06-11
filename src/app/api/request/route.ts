import { connectToDatabase } from "@/lib/database/mongoose";
import PaperRequest from "@/db/paperRequest";
import { success, failure } from "@/lib/utils/response";

export async function POST(req: Request) {
  try {
    await connectToDatabase();
    const body = (await req.json()) as {
      subject: string;
      exam: string;
      slot: string;
      year: string;
    };

    const { subject, exam, slot, year } = body;

    if (!subject || !exam || !slot || !year) {
      return failure("All fields are required.", 400);
    }

    const newRequest = await PaperRequest.create({ subject, exam, slot, year });
    return success({ message: "Paper request submitted successfully!", request: newRequest }, "Created", 201);
  } catch (error) {
    console.error("Error creating paper request:", error);
    return failure("Failed to submit request.", 500, error);
  }
}
