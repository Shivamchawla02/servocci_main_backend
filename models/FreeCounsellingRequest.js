import mongoose from "mongoose";

const FreeCounsellingRequestSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String, required: true },
  email: { type: String },
  preferredDate: { type: String, required: true },
  preferredTime: { type: String, required: true },
  message: { type: String },
  course: { type: String }, // ✅ added course field
  createdAt: { type: Date, default: Date.now }
});

const FreeCounsellingRequest = mongoose.model(
  "FreeCounsellingRequest",
  FreeCounsellingRequestSchema
);

export default FreeCounsellingRequest;
