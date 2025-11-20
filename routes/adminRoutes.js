import express from "express";
import Student from "../models/Student.js";
import sendEmail from "../utils/sendEmail.js";

const router = express.Router();

/* -----------------------------------
   ADMIN — Create Student (Optional)
----------------------------------- */
router.post("/register-student", async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;

    if (!name || !email || !phone || !password) {
      return res.status(400).json({ success: false, message: "All fields are required" });
    }

    if (!email.includes("@"))
      return res.status(400).json({ success: false, message: "Invalid email format" });

    if (!/^\d{10}$/.test(phone))
      return res.status(400).json({ success: false, message: "Invalid phone number" });

    // Check duplicates
    if (await Student.findOne({ email })) {
      return res.status(400).json({ success: false, message: "Email already registered" });
    }

    if (await Student.findOne({ phone })) {
      return res.status(400).json({ success: false, message: "Phone already registered" });
    }

    const student = await Student.create({ name, email, phone, password });

    // Optional admin-send email
    await sendEmail(
      email,
      "Welcome to Servocci!",
      `<p>Hello ${name}, your account has been created successfully!</p>`
    );

    return res.status(201).json({
      success: true,
      message: "Student created successfully",
      student,
    });

  } catch (err) {
    console.error("Admin Register Error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

/* -----------------------------------
   (Optional) ADD MORE ADMIN FUNCTIONS HERE
----------------------------------- */
// Example:
// router.get("/students", async (req, res) => {});
// router.delete("/student/:id", async (req, res) => {});

export default router;
