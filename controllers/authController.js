import Student from "../models/Student.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import sendEmail from "../utils/sendEmail.js";

const JWT_SECRET = process.env.JWT_SECRET;

// =========================
// REGISTER
// =========================
export const registerStudent = async (req, res) => {
  const { name, email, phone, password } = req.body;

  try {
    const existing = await Student.findOne({ email });
    if (existing)
      return res.status(400).json({ message: "Email already exists" });

    const student = await Student.create({ name, email, phone, password });

    return res.status(201).json({ message: "Registered successfully" });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

// =========================
// LOGIN
// =========================
export const loginStudent = async (req, res) => {
  const { email, password } = req.body;

  try {
    const student = await Student.findOne({ email });
    if (!student) return res.status(400).json({ message: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, student.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    const token = jwt.sign({ id: student._id }, JWT_SECRET, { expiresIn: "1d" });

    res.json({
      token,
      user: {
        id: student._id,
        name: student.name,
        email: student.email,
        phone: student.phone
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// =========================
// FORGOT PASSWORD
// =========================
export const forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    const student = await Student.findOne({ email });
    if (!student)
      return res.status(404).json({ message: "User not found" });

    const resetToken = crypto.randomBytes(32).toString("hex");

    student.resetToken = resetToken;
    student.resetTokenExpire = Date.now() + 10 * 60 * 1000;
    await student.save();

    const resetURL = `https://servocci.com/reset-password/${resetToken}`;

    await sendEmail(
      email,
      "Password Reset Link",
      `
        <p>Click the link below to reset your password:</p>
        <a href="${resetURL}">${resetURL}</a>
      `
    );

    res.json({ message: "Reset link sent" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// =========================
// RESET PASSWORD
// =========================
export const resetPassword = async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  try {
    const student = await Student.findOne({
      resetToken: token,
      resetTokenExpire: { $gt: Date.now() },
    });

    if (!student)
      return res.status(400).json({ message: "Invalid or expired token" });

    student.password = password;
    student.resetToken = undefined;
    student.resetTokenExpire = undefined;

    await student.save();

    res.json({ message: "Password updated successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// =========================
// GET PROFILE
// =========================
export const getProfile = async (req, res) => {
  res.json(req.user);
};
