import express from "express";
import Resume from "../models/Resume.js";

const router = express.Router();

/**
 * ✅ Save resume (from frontend)
 * POST /api/resumes
 */
router.post("/save-resume", async (req, res) => {
  try {
    const { name, email, resumeUrl } = req.body;

    if (!name || !email || !resumeUrl) {
      return res.status(400).json({ message: "All fields are required." });
    }

    const newResume = new Resume({ name, email, resumeUrl });
    await newResume.save();

    res.status(201).json({ message: "Resume saved successfully!" });
  } catch (error) {
    console.error("❌ Error saving resume:", error);
    res.status(500).json({ message: "Server error while saving resume." });
  }
});

/**
 * ✅ Get all resumes (for admin dashboard)
 * GET /api/resumes
 */
router.get("/", async (req, res) => {
  try {
    const resumes = await Resume.find().sort({ uploadedAt: -1 }); // newest first
    res.json(resumes);
  } catch (error) {
    console.error("❌ Error fetching resumes:", error);
    res.status(500).json({ message: "Server error while fetching resumes." });
  }
});

export default router;
