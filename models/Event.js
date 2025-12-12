import mongoose from "mongoose";

const EventSchema = new mongoose.Schema({
  title: String,
  date: String,
  description: String,
  coverImage: String,
  extraImages: [String],
}, { timestamps: true });

export default mongoose.model("Event", EventSchema);
