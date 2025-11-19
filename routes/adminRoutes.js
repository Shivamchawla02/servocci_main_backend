// routes/adminRoutes.js
import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import Student from "../models/Student.js";
import sendEmail from "../utils/sendEmail.js";

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret_here";

// Generate JWT Token
const generateToken = (payload) => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "1d" });
};

/* -----------------------------------
   STUDENT REGISTER
----------------------------------- */
router.post("/register-student", async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;

    if (!name || !email || !phone || !password) {
      return res
        .status(400)
        .json({ msg: "Name, email, phone and password are required." });
    }

    const existingEmail = await Student.findOne({ email });
    if (existingEmail)
      return res.status(400).json({ msg: "Email already registered" });

    const existingPhone = await Student.findOne({ phone });
    if (existingPhone)
      return res.status(400).json({ msg: "Phone already registered" });

    // password auto-hashed by pre('save')
    const newUser = await Student.create({ name, email, phone, password });

    return res.status(201).json({
      msg: "Student registered successfully",
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        phone: newUser.phone,
      },
    });
  } catch (err) {
    console.error("Register Student Error:", err);
    res.status(500).json({ msg: "Server error" });
  }
});

/* -----------------------------------
   STUDENT LOGIN
----------------------------------- */
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ msg: "Email and password required" });

    const user = await Student.findOne({ email });
    if (!user) return res.status(400).json({ msg: "Invalid credentials" });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(400).json({ msg: "Invalid credentials" });

    const role = user.isAdmin ? "admin" : "student";
    const token = generateToken({ id: user._id, email: user.email, role });

    return res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role,
      },
    });
  } catch (err) {
    console.error("Login Error:", err);
    return res.status(500).json({ msg: "Server error" });
  }
});

/* -----------------------------------
   FORGOT PASSWORD
----------------------------------- */
router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ msg: "Email required" });

    const user = await Student.findOne({ email });
    if (!user) return res.status(404).json({ msg: "Email not found" });

    const resetToken = crypto.randomBytes(32).toString("hex");
    user.resetToken = resetToken;
    user.resetTokenExpire = Date.now() + 10 * 60 * 1000; // 10 min
    await user.save();

    const link = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

    await sendEmail(
      email,
      "Reset Password - Servocci",
      `
        <h2>Password Reset Request</h2>
        <p>Click the link below to reset your password:</p>
        <a href="${link}" target="_blank">${link}</a>
        <p>This link is valid for 10 minutes.</p>
      `
    );

    return res.json({ msg: "Reset link sent to your email." });
  } catch (err) {
    console.error("Forgot Password Error:", err);
    res.status(500).json({ msg: "Server error" });
  }
});

/* -----------------------------------
   RESET PASSWORD
----------------------------------- */
router.post("/reset-password/:token", async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    if (!password)
      return res.status(400).json({ msg: "New password required" });

    const user = await Student.findOne({
      resetToken: token,
      resetTokenExpire: { $gt: Date.now() },
    });

    if (!user) return res.status(400).json({ msg: "Invalid or expired token" });

    // Student model auto-hashes password
    user.password = password;

    user.resetToken = undefined;
    user.resetTokenExpire = undefined;

    await user.save();

    return res.json({ msg: "Password reset successful" });
  } catch (err) {
    console.error("Reset Password Error:", err);
    res.status(500).json({ msg: "Server error" });
  }
});

export default router;
