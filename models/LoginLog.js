import mongoose from "mongoose";

const loginLogSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "Student" },
    name: String,
    email: String,
    ip: String,
    userAgent: String,
    loginTime: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

export default mongoose.model("LoginLog", loginLogSchema);
