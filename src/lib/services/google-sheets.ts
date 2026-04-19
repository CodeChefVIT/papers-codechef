import { google, sheets_v4 } from "googleapis";
import { JWT } from "google-auth-library";

const SCOPES = ["https://www.googleapis.com/auth/spreadsheets"];
const SHEET_ID = process.env.SHEET_ID;

export async function getGoogleSheetsAuth(): Promise<JWT> {
  return new google.auth.JWT({
    email: process.env.GOOGLE_CLIENT_EMAIL,
    key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    scopes: SCOPES,
  });
}

export async function appendEmailToSheet(email: string): Promise<void> {
  const authClient = await getGoogleSheetsAuth();
  const sheets: sheets_v4.Sheets = google.sheets({
    version: "v4",
    auth: authClient,
  });

  await sheets.spreadsheets.values.append({
    spreadsheetId: SHEET_ID,
    range: "Sheet1!A:A",
    valueInputOption: "RAW",
    requestBody: {
      values: [[email]],
    },
  });
}