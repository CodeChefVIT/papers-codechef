import mongoose, { Schema, type Model } from "mongoose";

export type IUpcomingSchedule = {
  date: string;
  slot: "A" | "B" | "C" | "D" | "E" | "F" | "G";
};

const upcomingScheduleSchema = new Schema<IUpcomingSchedule>(
  {
    date: { type: String, required: true, unique: true },
    slot: {
      type: String,
      required: true,
      enum: ["A", "B", "C", "D", "E", "F", "G"],
    },
  },
  { timestamps: true },
);

const UpcomingSchedule: Model<IUpcomingSchedule> =
  mongoose.models.UpcomingSchedule ??
  mongoose.model<IUpcomingSchedule>("UpcomingSchedule", upcomingScheduleSchema);

export default UpcomingSchedule;
