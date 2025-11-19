import jwt from "jsonwebtoken";
import Student from "../models/Student.js";
import sendEmail from "../utils/sendEmail.js";
import crypto from "crypto";

const generateToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "7d" });

export const registerStudent = async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;
    if (await Student.findOne({ email })) return res.status(400).json({ message: "Email already exists" });

    const student = await Student.create({ name, email, phone, password });

    return res.status(201).json({
      success: true,
      message: "Student registered successfully",
      token: generateToken(student._id),
      student: { id: student._id, name: student.name, email: student.email, phone: student.phone },
    });
  } catch (err) {
    console.error("Register Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

export const loginWithPassword = async (req, res) => {
  try {
    const { email, password } = req.body;
    const student = await Student.findOne({ email });
    if (!student || !(await student.matchPassword(password))) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    res.json({
      success: true,
      token: generateToken(student._id),
      student: { id: student._id, name: student.name, email: student.email, phone: student.phone },
    });
  } catch (err) {
    console.error("Login Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const student = await Student.findOne({ email });
    if (!student) return res.status(404).json({ message: "Email not found" });

    const resetToken = crypto.randomBytes(32).toString("hex");
    student.resetToken = resetToken;
    student.resetTokenExpire = Date.now() + 10 * 60 * 1000;
    await student.save();

    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
    await sendEmail(email, "Password Reset", `Click to reset your password: ${resetUrl}`);

    res.json({ success: true, message: "Reset email sent successfully" });
  } catch (err) {
    console.error("Forgot Password Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    const student = await Student.findOne({ resetToken: token, resetTokenExpire: { $gt: Date.now() } });
    if (!student) return res.status(400).json({ message: "Invalid or expired token" });

    student.password = password;
    student.resetToken = undefined;
    student.resetTokenExpire = undefined;
    await student.save();

    res.json({ success: true, message: "Password reset successful" });
  } catch (err) {
    console.error("Reset Password Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

export const getProfile = async (req, res) => {
  try {
    const student = await Student.findById(req.user.id).select("-password");
    res.json({ success: true, student });
  } catch (err) {
    console.error("Profile Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
