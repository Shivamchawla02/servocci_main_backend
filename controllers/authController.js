import jwt from "jsonwebtoken";
import Student from "../models/Student.js";
import sendEmail from "../utils/sendEmail.js";
import crypto from "crypto";

// Generate JWT token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "7d" });
};

// =========================
// REGISTER STUDENT
// =========================
export const registerStudent = async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;

    // Validate input
    if (!name || !email || !phone || !password)
      return res.status(400).json({ success: false, message: "All fields are required" });

    if (!email.includes("@"))
      return res.status(400).json({ success: false, message: "Invalid email format" });

    if (!/^\d{10}$/.test(phone))
      return res.status(400).json({ success: false, message: "Invalid phone number" });

    // Check for duplicates
    if (await Student.findOne({ email }))
      return res.status(400).json({ success: false, message: "Email already registered" });

    if (await Student.findOne({ phone }))
      return res.status(400).json({ success: false, message: "Phone already registered" });

    // Create student (password auto-hashed in schema pre-save)
    const student = await Student.create({ name, email, phone, password });

    // Optional: send welcome email
    await sendEmail(
      email,
      "Welcome to Servocci!",
      `<p>Hello ${name},</p><p>Your account has been created successfully!</p>`
    );

    // Return consistent response
    return res.status(201).json({
      success: true,
      token: generateToken(student._id),
      student: {
        id: student._id,
        name: student.name,
        email: student.email,
        phone: student.phone,
      },
    });
  } catch (err) {
    console.error("Register Error:", err);
    if (err.code === 11000) {
      const field = Object.keys(err.keyPattern)[0];
      return res.status(400).json({ success: false, message: `${field} already exists` });
    }
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// =========================
// LOGIN STUDENT
// =========================
export const loginStudent = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return res.status(400).json({ success: false, message: "Email and password required" });

    const student = await Student.findOne({ email });
    if (!student)
      return res.status(400).json({ success: false, message: "Invalid email or password" });

    const isMatch = await student.matchPassword(password);
    if (!isMatch)
      return res.status(400).json({ success: false, message: "Invalid email or password" });

    return res.json({
      success: true,
      token: generateToken(student._id),
      student: {
        id: student._id,
        name: student.name,
        email: student.email,
        phone: student.phone,
      },
    });
  } catch (err) {
    console.error("Login Error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// =========================
// FORGOT PASSWORD
// =========================
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ success: false, message: "Email required" });

    const student = await Student.findOne({ email });
    if (!student) return res.status(404).json({ success: false, message: "Email not found" });

    const resetToken = crypto.randomBytes(32).toString("hex");
    student.resetToken = resetToken;
    student.resetTokenExpire = Date.now() + 10 * 60 * 1000; // 10 minutes
    await student.save();

    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

    await sendEmail(
      email,
      "Reset Password - Servocci",
      `<p>Click this link to reset your password: <a href="${resetUrl}">${resetUrl}</a></p>`
    );

    res.json({ success: true, message: "Reset link sent to your email" });
  } catch (err) {
    console.error("Forgot Password Error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// =========================
// RESET PASSWORD
// =========================
export const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    if (!password) return res.status(400).json({ success: false, message: "New password required" });

    const student = await Student.findOne({
      resetToken: token,
      resetTokenExpire: { $gt: Date.now() },
    });

    if (!student) return res.status(400).json({ success: false, message: "Invalid or expired token" });

    student.password = password; // pre-save hook hashes it
    student.resetToken = undefined;
    student.resetTokenExpire = undefined;

    await student.save();

    res.json({ success: true, message: "Password reset successful" });
  } catch (err) {
    console.error("Reset Password Error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// =========================
// GET PROFILE
// =========================
export const getProfile = async (req, res) => {
  try {
    const student = await Student.findById(req.user.id).select("-password");
    res.json({ success: true, student });
  } catch (err) {
    console.error("Profile Error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
