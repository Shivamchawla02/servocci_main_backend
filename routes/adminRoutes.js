import express from "express";
import Institution from "../models/Institution.js";
import Student from "../models/Student.js";

const router = express.Router();

// Get all students
router.get("/users", async (req, res) => {
  try {
    const students = await Student.find().select("-password");
    res.json(students);
  } catch (err) {
    console.error("Error fetching students:", err);
    res.status(500).json({ msg: "Server error" });
  }
});

// Get all institutions
router.get("/institutions", async (req, res) => {
  try {
    const institutions = await Institution.find().select("-password");
    res.json(institutions);
  } catch (err) {
    console.error("Error fetching institutions:", err);
    res.status(500).json({ msg: "Server error" });
  }
});

export default router;
