import { connectToDatabase } from "@/lib/database/mongoose";
import Feedback from "@/db/feedback";
import { CustomError } from "@/lib/utils/error";

const MAX_MESSAGE_LENGTH = 2000;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export interface CreateFeedbackInput {
  message?: unknown;
  email?: unknown;
}

export async function createFeedback({ message, email }: CreateFeedbackInput) {
  const trimmedMessage = typeof message === "string" ? message.trim() : "";

  if (!trimmedMessage) {
    throw new CustomError("Feedback message is required.", 400);
  }

  if (trimmedMessage.length > MAX_MESSAGE_LENGTH) {
    throw new CustomError(
      `Feedback message must be under ${MAX_MESSAGE_LENGTH} characters.`,
      400,
    );
  }

  let trimmedEmail: string | undefined;
  if (typeof email === "string" && email.trim().length > 0) {
    trimmedEmail = email.trim();
    if (!EMAIL_REGEX.test(trimmedEmail)) {
      throw new CustomError("Invalid email format.", 400);
    }
  }

  await connectToDatabase();
  return await Feedback.create({
    message: trimmedMessage,
    email: trimmedEmail,
  });
}
