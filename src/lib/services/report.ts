import { connectToDatabase } from "@/lib/database/mongoose";
import TagReport from "@/db/tagReport";
import { CustomError } from "@/lib/utils/error";

const exams: string[] = ["CAT-1", "CAT-2", "FAT", "Model CAT-1", "Model CAT-2", "Model FAT"]
const ALLOWED_FIELDS = ["subject", "courseCode", "exam", "slot", "year"];
const MAX_REPORTS_PER_PAPER = 5; 

export interface ReportTagBody {
  paperId?: string;
  reportedFields?: unknown;
  comment?: unknown;
  reporterEmail?: unknown;
  reporterId?: unknown;
}

interface ReportedFieldInput {
  field: string;
  value?: string;
}

export async function reportTag(paperId: string, body: ReportTagBody) {
  await connectToDatabase();
  const MAX_REPORTS_PER_PAPER = 5; 
  const count = await TagReport.countDocuments({ paperId });

  if (count >= MAX_REPORTS_PER_PAPER) {
    throw new CustomError("Received many reports; we are currently working on it.", 429)
  }
    const reportedFields: ReportedFieldInput[] = Array.isArray(body.reportedFields)
      ? body.reportedFields
        .map((r): ReportedFieldInput | null => {
          if (!r || typeof r !== "object") return null;

          const field = typeof (r as { field?: unknown }).field === "string" ? (r as { field: string }).field.trim() : "";
          const value = typeof (r as { value?: unknown }).value === "string" ? (r as { value: string }).value.trim() : undefined;
          return field ? { field, value } : null;
        })
          .filter((r): r is ReportedFieldInput => r !== null):[];

  for (const rf of reportedFields) {
    if (!ALLOWED_FIELDS.includes(rf.field)) {
      throw new CustomError(`Invalid field: ${rf.field}`, 400);
    }
    
    if (rf.field === "exam" && rf.value) {
      if (!exams.some(e => e.toLowerCase() === rf.value?.toLowerCase())) {
        throw new CustomError(`Invalid exam value: ${rf.value}`, 400);
      }
    }
  }

  const newReport = await TagReport.create({
    paperId,
    reportedFields,
    comment: typeof body.comment === "string" ? body.comment : undefined,
    reporterEmail: typeof body.reporterEmail === "string" ? body.reporterEmail : undefined,
    reporterId: typeof body.reporterId === "string" ? body.reporterId : undefined,

  });
  return newReport;
}