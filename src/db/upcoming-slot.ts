import { type IUpcomingSlot } from "@/interface";
import mongoose, { Schema, type Model } from "mongoose";

const upcomingSlotSchema = new Schema<IUpcomingSlot>({
  slot: { type: String, required: true, unique: true },
  lastSyncedDate: { type: String },
  syncMode: {
    type: String,
    enum: ["CAT", "FAT"],
    default: "CAT",
  },
});

const UpcomingSlot: Model<IUpcomingSlot> =
  mongoose.models.UpcomingSlot ?? mongoose.model<IUpcomingSlot>("UpcomingSlot", upcomingSlotSchema);

export default UpcomingSlot;
