import { verifyEmail } from "@devmehq/email-validator-js";
import { appendEmailToSheet } from "@/lib/services/google-sheets";
import { CustomError } from "@/lib/utils/error";

export async function subscribeEmail(email: string) {
  const result = await verifyEmail({
      emailAddress: email,
      verifyMx: true,
      verifySmtp: false,
      timeout: 4000
    });

  if (!result.validFormat) {
    throw new CustomError("Invalid email format", 400);
  }

  if (!result.validMx) {
    throw new CustomError("Email domain is invalid", 400);
  }

  await appendEmailToSheet(email);
}