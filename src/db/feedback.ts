import mongoose, { Schema, type Document, type Model } from "mongoose";

export interface IFeedback extends Document {
  message: string;
  email?: string;
  createdAt: Date;
}

const feedbackSchema = new Schema<IFeedback>({
  message: { type: String, required: true },
  email: { type: String },
  createdAt: { type: Date, default: Date.now },
});

feedbackSchema.index({ createdAt: -1 });

const Feedback: Model<IFeedback> =
  mongoose.models.Feedback ??
  mongoose.model<IFeedback>("Feedback", feedbackSchema);

export default Feedback;
