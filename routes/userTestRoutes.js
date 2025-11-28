// routes/userTestRoutes.js
import express from "express";
import UserTest from "../models/UserTest.js";
import Student from "../models/Student.js"; // ✅ Import Student model
import {
  addUserTest,
  getAllUserTests,
  updateUserTestReport,
} from "../controllers/userTestController.js";

const router = express.Router();

// ➕ Save user test details
router.post("/", addUserTest);
router.post("/add", addUserTest);

// 📋 Fetch all user test submissions
router.get("/", getAllUserTests);

// 📝 Update report URL (after Cloudinary upload)
router.put("/:id", updateUserTestReport);

// 🔍 Get user test by email
router.get("/email/:email", async (req, res) => {
  try {
    const { email } = req.params;
    const user = await UserTest.findOne({ email: email.toLowerCase() });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "No report found for this email",
      });
    }

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    console.error("❌ Error fetching test report by email:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
});

// ✅ Mark psychometricTestGiven = true when student starts test
// Example usage: frontend calls this endpoint on "Start Test" or "Proceed"
router.patch("/start/:email", async (req, res) => {
  try {
    const { email } = req.params;

    const student = await Student.findOne({ email: email.toLowerCase() });

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    student.psychometricTestGiven = true;
    await student.save();

    res.status(200).json({
      success: true,
      message: "Student marked as started psychometric test",
      data: student,
    });
  } catch (error) {
    console.error("❌ Error updating psychometricTestGiven:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
});

export default router;
