import mongoose from "mongoose";

const subscriptionSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["student", "institution"],
      required: true,
    },
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, "Please provide a valid email address"],
    },
    phone: {
      type: String,
      trim: true,
      match: [/^\d{10}$/, "Phone number must be 10 digits"],
    },
    address: { type: String, trim: true },
    remarks: { type: String, trim: true },
    grade: { type: String },
    school: { type: String, trim: true },
    exam: { type: String, trim: true },
    contactPerson: { type: String, trim: true },
  },
  { timestamps: true }
);

export default mongoose.model("Subscription", subscriptionSchema);
