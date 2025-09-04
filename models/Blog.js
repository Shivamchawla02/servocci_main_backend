import mongoose from "mongoose";

const blogSchema = new mongoose.Schema({
  title: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  description: { type: String, required: true },
  content: { type: String, required: true },
  category: { type: String, required: true },
  author: {
    name: { type: String, required: true },
    role: { type: String, required: true },
  },
  date: { type: Date, default: Date.now },
  approved: { type: Boolean, default: false },
  deleted: { type: Boolean, default: false }, // 👈 new soft delete flag
});

export default mongoose.model("Blog", blogSchema);
