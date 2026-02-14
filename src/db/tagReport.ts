import mongoose, { Schema, type Document, type Model } from "mongoose";

export interface ITagReport extends Document {
  paperId: string;
  comment?: string;
  reporterEmail?: string;
  reporterId?: string;
  reportedFields?: { field: string; value?: string }[];
  resolved: boolean;
  createdAt: Date;
}

const tagReportSchema = new Schema<ITagReport>({
  paperId: { type: String, required: true },
  comment: { type: String },
  reporterEmail: { type: String },
  reporterId: { type: String },
  reportedFields: {
    type: [
      new Schema(
        {
          field: { type: String, required: true },
          value: { type: String },
        },
        { _id: false },
      ),
    ],
    default: [],
  },
  resolved: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

tagReportSchema.index({ paperId: 1, resolved: 1, createdAt: -1 });

const TagReport: Model<ITagReport> =
  mongoose.models.TagReport ??
  mongoose.model<ITagReport>("TagReport", tagReportSchema);

export default TagReport;
