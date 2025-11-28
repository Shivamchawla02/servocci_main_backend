import express from "express";
import Student from "../models/Student.js";

const router = express.Router();

// ---------------------------------------------
// GET all students (admin)
// ---------------------------------------------
router.get("/", async (req, res) => {
  try {
    const students = await Student.find().sort({ createdAt: -1 });
    res.json({
      success: true,
      count: students.length,
      data: students
    });
  } catch (error) {
    console.error("Error fetching students:", error);
    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
});


// ---------------------------------------------
// UPDATE specific field (admin panel toggles)
// ---------------------------------------------
// Body Example: { field: "psychometricTestGiven", value: true }
router.patch("/update-field/:id", async (req, res) => {
  try {
    const { field, value } = req.body;

    const updatedStudent = await Student.findByIdAndUpdate(
      req.params.id,
      { [field]: value }, // <-- dynamic field update
      { new: true }
    );

    if (!updatedStudent) {
      return res.status(404).json({
        success: false,
        message: "Student not found"
      });
    }

    // Return updated student directly (frontend expects this)
    res.json(updatedStudent);

  } catch (error) {
    console.error("Error updating student:", error);
    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
});

export default router;
