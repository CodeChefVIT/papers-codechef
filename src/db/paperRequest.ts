import mongoose, { Schema, type Document, type Model } from "mongoose";

export const requestExams = ["CAT-1", "CAT-2", "FAT", "Model CAT-1", "Model CAT-2", "Model FAT"] as const;

export interface IPaperRequest extends Document {
  subject: string;
  exam: string;
  slot: string;
  year: string;
  createdAt: Date;
}

const paperRequestSchema = new Schema<IPaperRequest>({
  subject: { type: String, required: true },
  exam: { type: String, enum: [...requestExams], required: true },
  slot: { type: String, required: true },
  year: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

paperRequestSchema.index({ subject: 1, exam: 1, slot: 1, year: 1 }, { unique: true });

const PaperRequest: Model<IPaperRequest> =
  mongoose.models.PaperRequest ??
  mongoose.model<IPaperRequest>("PaperRequest", paperRequestSchema);

export default PaperRequest;
