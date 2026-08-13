import mongoose, { Schema, type Model } from "mongoose";
import { type IPaper, type IAdminPaper } from "@/interface";

const adminSchema = new Schema<IAdminPaper>({
  file_url: { type: String, required: true },
  thumbnail_url: { type: String, required: false },
  subject: { type: String || null, index: true },
  slot: { type: String || null },
  year: { type: String || null },
  exam: {
    type: String || null,
    enum: ["CAT-1", "CAT-2", "FAT", "Model CAT-1", "Model CAT-2", "Model FAT"],
  },
  semester: {
    type: String || null,
    enum: [
      "Fall Semester",
      "Winter Semester",
      "Summer Semester",
      "Weekend Semester",
    ],
  },
  campus: {
    type: String || null,
    enum: [
      "Vellore",
      "Chennai",
      "Andhra Pradesh",
      "Bhopal",
      "Bangalore",
      "Mauritius",
    ],
  },
  school: {
    type: String || null,
    enum: ["SCOPE", "SITE", "SENSE", "SMEC", "SCE", "SELECT", "SAS", "SSL", "VITBS", "SBST","SCORE"],
  },
  answer_key_included: { type: Boolean || null, default: false },
  is_selected: { type: Boolean, default: false },
  ambiguous_tags: { type: [String], default: [] },
});

const paperSchema = new Schema<IPaper>({
  file_url: { type: String, required: true },
  thumbnail_url: { type: String, required: true },
  subject: { type: String, required: true, index: true },
  slot: { type: String, required: true },
  year: { type: String, required: true },
  exam: {
    type: String,
    enum: ["CAT-1", "CAT-2", "FAT", "Model CAT-1", "Model CAT-2", "Model FAT"],
    required: true,
  },
  semester: {
    type: String,
    enum: [
      "Fall Semester",
      "Winter Semester",
      "Summer Semester",
      "Weekend Semester",
    ],
    required: true,
  },
  campus: {
    type: String,
    enum: [
      "Vellore",
      "Chennai",
      "Andhra Pradesh",
      "Bhopal",
      "Bangalore",
      "Mauritius",
    ],
    required: true,
  },
  school: {
    type: String,
    enum: ["SCOPE", "SITE", "SENSE", "SMEC", "SCE", "SELECT", "SAS", "SSL", "VITBS", "SBST"],
  },
  answer_key_included: { type: Boolean, default: false },
});

export const PaperAdmin: Model<IAdminPaper> =
  mongoose.models.Admin ?? mongoose.model<IAdminPaper>("Admin", adminSchema);
const Paper: Model<IPaper> =
  mongoose.models.Paper ?? mongoose.model<IPaper>("Paper", paperSchema);

export default Paper;
