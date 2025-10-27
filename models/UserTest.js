import mongoose from "mongoose";

const userTestSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    plan: {
      type: String,
      enum: ["Basic", "Premium"],
      default: "Basic",
    },
    reportUrl: {
      type: String,
      default: null, // 🆕 Optional Cloudinary PDF report URL
    },
  },
  { timestamps: true }
);

export default mongoose.model("UserTest", userTestSchema);
