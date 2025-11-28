// routes/userTestRoutes.js
import express from "express";
import UserTest from "../models/UserTest.js";
import Student from "../models/Student.js";

const router = express.Router();

// ---------------------------------------------
// POST a new user test
// ---------------------------------------------
router.post("/", async (req, res) => {
  try {
    const { name, email, score, reportUrl } = req.body;

    // 1️⃣ Save the test details
    const newTest = new UserTest({
      name,
      email: email.toLowerCase(),
      score,
      reportUrl,
    });

    await newTest.save();

    // 2️⃣ Update Student record to mark psychometricTestGiven = true
    const student = await Student.findOne({ email: email.toLowerCase() });

    if (student) {
      student.psychometricTestGiven = true;
      await student.save();
      console.log(`✅ Updated psychometricTestGiven for ${email}`);
    } else {
      console.log(`⚠️ No student found with email: ${email}`);
    }

    res.status(201).json({
      success: true,
      message: "Test saved and student updated successfully",
      data: newTest,
    });
  } catch (error) {
    console.error("❌ Error saving user test:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
});

// ---------------------------------------------
// GET all user tests (admin)
// ---------------------------------------------
router.get("/", async (req, res) => {
  try {
    const tests = await UserTest.find().sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      count: tests.length,
      data: tests,
    });
  } catch (error) {
    console.error("❌ Error fetching user tests:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

// ---------------------------------------------
// DELETE a user test by ID (admin)
// ---------------------------------------------
router.delete("/:id", async (req, res) => {
  try {
    const deletedTest = await UserTest.findByIdAndDelete(req.params.id);

    if (!deletedTest) {
      return res.status(404).json({
        success: false,
        message: "User test not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "User test deleted successfully",
    });
  } catch (error) {
    console.error("❌ Error deleting user test:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

export default router;
