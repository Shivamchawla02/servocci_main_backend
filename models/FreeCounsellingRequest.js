import mongoose from "mongoose";

const FreeCounsellingRequestSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String, required: true },
  email: { type: String },
  preferredDate: { type: String, required: true },
  message: { type: String },
  createdAt: { type: Date, default: Date.now }
});

const FreeCounsellingRequest = mongoose.model("FreeCounsellingRequest", FreeCounsellingRequestSchema);

export default FreeCounsellingRequest;
