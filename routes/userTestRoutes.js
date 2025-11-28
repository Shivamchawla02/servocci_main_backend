// controllers/userTestController.js
import UserTest from "../models/UserTest.js";
import Student from "../models/Student.js"; // ✅ Import Student model

// Add user test
export const addUserTest = async (req, res) => {
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
};
