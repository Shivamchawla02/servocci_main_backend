import mongoose from "mongoose";

const ResumeSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  qualification: { type: String, required: true },
  educationLevel: { type: String, required: true },
  yearOfPassing: { type: String, required: true },
  experience: { type: String, required: true },
  resumeUrl: { type: String, required: true },
  uploadedAt: { type: Date, default: Date.now },
});

const Resume = mongoose.model("Resume", ResumeSchema);
export default Resume;
