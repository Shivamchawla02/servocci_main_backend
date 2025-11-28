import express from "express";
import {
  addUserTest,
  getAllUserTests,
  updateUserTestReport,
} from "../controllers/userTestController.js";

const router = express.Router();

// ➕ Save user test details
// When this route is called, the controller will also mark psychometricTestGiven = true
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
    const user = await (await import("../models/UserTest.js")).default.findOne({
      email: email.toLowerCase(),
    });

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

export default router;
