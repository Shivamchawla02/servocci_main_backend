import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import Student from "../models/Student.js";
import sendEmail from "../utils/sendEmail.js"; // your Nodemailer function
import crypto from "crypto";

// Generate JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "7d" });
};

// -----------------------------------------
// REGISTER
// -----------------------------------------
export const registerStudent = async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;

    const exists = await Student.findOne({ email });
    if (exists) return res.status(400).json({ message: "Email already exists" });

    const student = await Student.create({ name, email, phone, password });

    res.status(201).json({
      success: true,
      student,
      token: generateToken(student._id),
    });
  } catch (err) {
    console.error("Register Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// -----------------------------------------
// LOGIN WITH PASSWORD
// -----------------------------------------
export const loginWithPassword = async (req, res) => {
  try {
    const { email, password } = req.body;

    const student = await Student.findOne({ email });
    if (!student) return res.status(404).json({ message: "User not found" });

    const isMatch = await student.matchPassword(password);
    if (!isMatch) return res.status(400).json({ message: "Invalid password" });

    res.json({
      success: true,
      token: generateToken(student._id),
      student,
    });
  } catch (err) {
    console.error("Login Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// -----------------------------------------
// OTP LOGIN (after Firebase verifies phone)
// -----------------------------------------
export const loginWithOTP = async (req, res) => {
  try {
    const { phone } = req.body;

    let user = await Student.findOne({ phone });

    if (!user) {
      // Auto-create account for OTP user
      user = await Student.create({
        name: "User",
        email: `${phone}@servocci.com`,
        phone,
        password: crypto.randomBytes(8).toString("hex"),
      });
    }

    res.json({
      success: true,
      message: "OTP verified",
      token: generateToken(user._id),
      user,
    });
  } catch (err) {
    console.error("OTP Login Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// -----------------------------------------
// FIREBASE AUTH VERIFY
// -----------------------------------------
export const verifyFirebaseUser = async (req, res) => {
  try {
    const { firebaseUID, phone } = req.body;

    let user = await Student.findOne({ phone });

    if (!user) {
      user = await Student.create({
        name: "User",
        email: `${phone}@servocci.com`,
        phone,
        firebaseUID,
        password: crypto.randomBytes(8).toString("hex"),
      });
    } else {
      user.firebaseUID = firebaseUID;
      await user.save();
    }

    res.json({
      success: true,
      token: generateToken(user._id),
      user,
    });
  } catch (err) {
    console.error("Firebase Verify Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// -----------------------------------------
// FORGOT PASSWORD
// -----------------------------------------
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await Student.findOne({ email });
    if (!user) return res.status(404).json({ message: "Email not found" });

    const resetToken = crypto.randomBytes(32).toString("hex");
    user.resetToken = resetToken;
    user.resetTokenExpire = Date.now() + 10 * 60 * 1000; // 10 minutes
    await user.save();

    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

    await sendEmail(email, "Password Reset", `Reset your password: ${resetUrl}`);

    res.json({ success: true, message: "Email sent successfully" });
  } catch (err) {
    console.error("Forgot Password Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// -----------------------------------------
// RESET PASSWORD
// -----------------------------------------
export const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    const user = await Student.findOne({
      resetToken: token,
      resetTokenExpire: { $gt: Date.now() },
    });

    if (!user) return res.status(400).json({ message: "Invalid or expired token" });

    user.password = password;
    user.resetToken = undefined;
    user.resetTokenExpire = undefined;

    await user.save();

    res.json({ success: true, message: "Password reset successful" });
  } catch (err) {
    console.error("Reset Password Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// -----------------------------------------
// GET PROFILE
// -----------------------------------------
export const getProfile = async (req, res) => {
  try {
    const user = await Student.findById(req.user.id).select("-password");
    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};
