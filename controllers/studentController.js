import Student from "../models/Student.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import sendEmail from "../utils/sendEmail.js";
import crypto from "crypto";

const JWT_SECRET = process.env.JWT_SECRET;

// Generate JWT
const generateToken = (id) => {
  return jwt.sign({ id }, JWT_SECRET, { expiresIn: "7d" });
};

/* ================================
   REGISTER STUDENT
================================= */
export const registerStudent = async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;

    if (!name || !email || !phone || !password)
      return res.status(400).json({ success: false, message: "All fields are required" });

    const existingEmail = await Student.findOne({ email });
    if (existingEmail)
      return res.status(400).json({ success: false, message: "Email already exists" });

    const existingPhone = await Student.findOne({ phone });
    if (existingPhone)
      return res.status(400).json({ success: false, message: "Phone already exists" });

    const student = await Student.create({ name, email, phone, password });

    // Send welcome email
    await sendEmail(
      email,
      "Welcome to Servocci!",
      `<p>Hello ${name}, your account has been created successfully.</p>`
    );

    // Send admin alert email
    await sendEmail(
      "hello@servocci.com",
      "New Student Registered",
      `<p>New student registered: ${name}, ${email}, ${phone}</p>`
    );

    // ✅ Return token + user for frontend localStorage
    return res.status(201).json({
      success: true,
      token: generateToken(student._id),
      user: {
        id: student._id,
        name: student.name,
        email: student.email,
        phone: student.phone,
        isAdmin: student.isAdmin || false,
      },
    });
  } catch (err) {
    console.error("Register error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

/* ================================
   LOGIN STUDENT
================================= */
export const loginStudent = async (req, res) => {
  try {
    const { email, password } = req.body;

    const student = await Student.findOne({ email });
    if (!student)
      return res.status(400).json({ success: false, message: "Invalid email or password" });

    const isMatch = await student.matchPassword(password);
    if (!isMatch)
      return res.status(400).json({ success: false, message: "Invalid email or password" });

    return res.json({
      success: true,
      token: generateToken(student._id),
      user: {
        id: student._id,
        name: student.name,
        email: student.email,
        phone: student.phone,
        isAdmin: student.isAdmin || false,
      },
    });
  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

/* ================================
   FORGOT PASSWORD
================================= */
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const student = await Student.findOne({ email });
    if (!student) return res.status(404).json({ success: false, message: "Email not found" });

    const resetToken = crypto.randomBytes(32).toString("hex");
    student.resetToken = resetToken;
    student.resetTokenExpire = Date.now() + 10 * 60 * 1000;
    await student.save();

    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
    await sendEmail(email, "Reset Your Password", `<p>Click here: <a href="${resetUrl}">${resetUrl}</a></p>`);

    return res.json({ success: true, message: "Reset link sent to email" });
  } catch (err) {
    console.error("Forgot Password Error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

/* ================================
   RESET PASSWORD
================================= */
export const resetPassword = async (req, res) => {
  try {
    const student = await Student.findOne({
      resetToken: req.params.token,
      resetTokenExpire: { $gt: Date.now() },
    });

    if (!student) return res.status(400).json({ success: false, message: "Invalid or expired token" });

    student.password = req.body.password;
    student.resetToken = undefined;
    student.resetTokenExpire = undefined;
    await student.save();

    return res.json({ success: true, message: "Password reset successful" });
  } catch (err) {
    console.error("Reset error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

/* ================================
   GET PROFILE
================================= */
export const getProfile = async (req, res) => {
  try {
    const student = await Student.findById(req.user.id).select("-password");
    return res.json({ success: true, student });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Server error" });
  }
};
