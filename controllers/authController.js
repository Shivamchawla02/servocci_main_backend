import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import Student from "../models/Student.js";
import sendEmail from "../utils/sendEmail.js";
import crypto from "crypto";

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "7d" });
};

/* -----------------------------------------
   REGISTER STUDENT
----------------------------------------- */
export const registerStudent = async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;

    const exists = await Student.findOne({ email });
    if (exists) return res.status(400).json({ message: "Email already exists" });

    const student = await Student.create({ name, email, phone, password });

    return res.status(201).json({
      success: true,
      message: "Student registered successfully",
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
    return res.status(500).json({ message: "Server error" });
  }
};

/* -----------------------------------------
   LOGIN WITH PASSWORD
----------------------------------------- */
export const loginWithPassword = async (req, res) => {
  try {
    const { email, password } = req.body;

    const student = await Student.findOne({ email });
    if (!student)
      return res.status(400).json({ message: "Invalid email or password" });

    const isMatch = await student.matchPassword(password);
    if (!isMatch)
      return res.status(400).json({ message: "Invalid email or password" });

    return res.json({
      success: true,
      token: generateToken(student._id),
      student,
    });
  } catch (err) {
    console.error("Login Error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};


/* -----------------------------------------
   FORGOT PASSWORD
----------------------------------------- */
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await Student.findOne({ email });
    if (!user)
      return res.status(404).json({ message: "Email not found" });

    const resetToken = crypto.randomBytes(32).toString("hex");

    user.resetToken = resetToken;
    user.resetTokenExpire = Date.now() + 10 * 60 * 1000;
    await user.save();

    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

    await sendEmail(
      email,
      "Password Reset",
      `Click to reset your password: ${resetUrl}`
    );

    return res.json({
      success: true,
      message: "Reset email sent successfully",
    });
  } catch (err) {
    console.error("Forgot Password Error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

/* -----------------------------------------
   RESET PASSWORD
----------------------------------------- */
export const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    const user = await Student.findOne({
      resetToken: token,
      resetTokenExpire: { $gt: Date.now() },
    });

    if (!user)
      return res.status(400).json({ message: "Invalid or expired token" });

    user.password = password; // pre-save hook will hash it
    user.resetToken = undefined;
    user.resetTokenExpire = undefined;

    await user.save();

    return res.json({ success: true, message: "Password reset successful" });
  } catch (err) {
    console.error("Reset Password Error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

/* -----------------------------------------
   GET LOGGED-IN USER PROFILE
----------------------------------------- */
export const getProfile = async (req, res) => {
  try {
    const user = await Student.findById(req.user.id).select("-password");
    return res.json({ success: true, user });
  } catch (err) {
    console.error("Profile Error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};
