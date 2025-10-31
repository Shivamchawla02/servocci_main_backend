import mongoose from "mongoose";

const subscriptionSchema = new mongoose.Schema(
  {
    type: { type: String, enum: ["student", "institution"], required: true },
    name: String,
    grade: String,
    email: String,
    phone: String,
    school: String,
    exam: String,
    contactPerson: String,
    address: String,
    remarks: String,
  },
  { timestamps: true }
);

export default mongoose.model("Subscription", subscriptionSchema);
