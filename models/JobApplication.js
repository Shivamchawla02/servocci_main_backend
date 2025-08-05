import mongoose from "mongoose";

const jobApplicationSchema = new mongoose.Schema(
  {
    fullName: String,
    email: String,
    resumeUrl: String,
    jobTitle: String,
    company: String,
    location: String,
    preferredDate: String,
    preferredTime: String,
  },
  { timestamps: true }
);

const JobApplication = mongoose.model("JobApplication", jobApplicationSchema);
export default JobApplication;
