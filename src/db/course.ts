import mongoose, { Schema, type Model } from "mongoose";
import { type ICourseCount, type ICourses } from "@/interface";

const courseSchema = new Schema<ICourses>({
  name: { type: String, required: true },
  syllabus: { type: String, required: false },
});

const courseCountSchema = new Schema<ICourseCount>({
  name: { type: String, required: true, unique: true },
  count: { type: Number, required: true, default: 0 },
});

export const Course: Model<ICourses> =
  mongoose.models.Course ?? mongoose.model("Course", courseSchema);

const CourseCount: Model<ICourseCount> =
  mongoose.models.CourseCount ??
  mongoose.model<ICourseCount>("CourseCount", courseCountSchema);

export default CourseCount;
