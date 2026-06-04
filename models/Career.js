import mongoose from "mongoose";

const careerApplicationSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },

    email: {
      type: String,
      required: true,
    },

    phone: {
      type: String,
      required: true,
    },

    position: {
      type: String,
      required: true,
    },

    experience: String,

    location: String,

    linkedin: String,

    coverLetter: String,

    resumeUrl: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model(
  "CareerApplication",
  careerApplicationSchema
);