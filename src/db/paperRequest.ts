import mongoose, { Schema, type Document, type Model } from "mongoose";

export interface IPaperRequest extends Document {
  subject: string;
  exam: string;
  slot: string;
  year: string;
  createdAt: Date;
}

const paperRequestSchema = new Schema<IPaperRequest>({
  subject: { type: String, required: true },
  exam: { type: String, required: true },
  slot: { type: String, required: true },
  year: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

const PaperRequest: Model<IPaperRequest> =
  mongoose.models.PaperRequest ??
  mongoose.model<IPaperRequest>("PaperRequest", paperRequestSchema);

export default PaperRequest;
