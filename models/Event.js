import mongoose from "mongoose";

const EventSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    date: { type: String, required: true },
    description: { type: String, required: true },
    coverImage: { type: String, required: true },
    extraImages: { type: [String], default: [] }
  },
  { timestamps: true }
);

export default mongoose.model("Event", EventSchema);
