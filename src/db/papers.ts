import mongoose, { Schema, type Model } from "mongoose";
import { IPaper, type IAdminPaper, type ICourses } from "@/interface";

const adminSchema = new Schema<IAdminPaper>({
  public_id_cloudinary: { type: String, required: true },
  finalUrl: { type: String, required: true },
  thumbnailUrl: { type: String, required: true },
  subject: { type: String, required: true, index: true },
  slot: { type: String, required: true },
  year: { type: String, required: true },
  exam: { type: String, enum: ["CAT-1", "CAT-2", "FAT","Model CAT-1" , "Model CAT-2" , "Model FAT"], required: true },
  semester:{ type: String, enum: ["Fall" , "Winter" , "Summer", "Weekend"], required: true },
  campus:{ type: String, enum: ["Vellore" ,"Chennai" , "Andhra Pradesh" ,"Bhopal" , "Bangalore" , "Mauritius"], required: true },
  answerKeyIncluded: { type: Boolean, default: false },
  isSelected: { type: Boolean, default: false },
});
const paperSchema = new Schema<IPaper>({
  finalUrl: { type: String, required: true },
  thumbnailUrl: { type: String, required: true },
  subject: { type: String, required: true, index: true },
  slot: { type: String, required: true },
  year: { type: String, required: true },
  exam: { type: String, enum: ["CAT-1", "CAT-2", "FAT","Model CAT-1" , "Model CAT-2" , "Model FAT"], required: true },
  semester:{ type: String, enum: ["Fall" , "Winter" , "Summer", "Weekend"], required: true },
  campus:{ type: String, enum: ["Vellore" ,"Chennai" , "Andhra Pradesh" ,"Bhopal" , "Bangalore" , "Mauritius"], required: true },
  answerKeyIncluded: { type: Boolean, default: false },
});

const courseSchema = new Schema<ICourses>({
  name: { type: String, required: true },
});

// adminSchema.index({ subject: 1 });

export const PaperAdmin: Model<IAdminPaper> =
  mongoose.models.Admin ?? mongoose.model<IAdminPaper>("Admin", adminSchema);
export const Course: Model<ICourses> =
  mongoose.models.Course ?? mongoose.model("Course", courseSchema);
const Paper: Model<IPaper> =
  mongoose.models.Paper  ?? mongoose.model<IPaper>("Paper", paperSchema);

export default Paper;