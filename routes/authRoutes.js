import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import Student from "../models/Student.js";
import Institution from "../models/Institution.js";
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
  const { name, email, phone, password } = req.body;

  try {
    const existing = await Student.findOne({ email });
    if (existing) {
      return res.status(400).json({ msg: "Email already registered" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const student = await Student.create({
      name,
      email,
      phone,
      password: hashedPassword,
    });

    res.status(201).json({ msg: "Student registered successfully", student });
  } catch (err) {
    console.error("Register Student Error:", err);
    res.status(500).json({ msg: "Server error" });
  }
});

/* -----------------------------------
   INSTITUTION REGISTER
----------------------------------- */
router.post("/register-institution", async (req, res) => {
  const { email, password } = req.body;

  try {
    const existing = await Institution.findOne({ email });
    if (existing) {
      return res.status(400).json({ msg: "Email already registered" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const institution = await Institution.create({
      ...req.body,
      password: hashedPassword,
    });

    res.status(201).json({ msg: "Institution registered successfully", institution });
  } catch (err) {
    console.error("Register Institution Error:", err);
    res.status(500).json({ msg: "Server error" });
  }
});

/* -----------------------------------
   LOGIN (Student + Admin + Institution)
----------------------------------- */
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    let user = await Institution.findOne({ email });
    let role = user ? "institution" : null;

    if (!user) {
      user = await Student.findOne({ email });
      role = user ? (user.isAdmin ? "admin" : "student") : null;
    }

    if (!user) return res.status(400).json({ msg: "Invalid credentials" });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(400).json({ msg: "Invalid credentials" });

    const token = generateToken({ id: user._id, email: user.email, role });

    res.json({
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
    res.status(500).json({ msg: "Server error" });
  }
});

/* -----------------------------------
   OTP LOGIN (Firebase Verified Phone)
----------------------------------- */
router.post("/otp-login", async (req, res) => {
  const { phone } = req.body;

  try {
    let user = await Student.findOne({ phone });

    if (!user) {
      user = await Student.create({
        name: "User",
        phone,
        email: `${phone}@servocci.com`,
        password: crypto.randomBytes(10).toString("hex"),
      });
    }

    const token = generateToken({ id: user._id, phone: user.phone, role: "student" });

    res.json({ token, user });
  } catch (err) {
    console.error("OTP Login Error:", err);
    res.status(500).json({ msg: "Server error" });
  }
});

/* -----------------------------------
   FORGOT PASSWORD
----------------------------------- */
router.post("/forgot-password", async (req, res) => {
  const { email } = req.body;

  try {
    const user = (await Student.findOne({ email })) || (await Institution.findOne({ email }));
    if (!user) return res.status(404).json({ msg: "Email not found" });

    const resetToken = crypto.randomBytes(32).toString("hex");
    user.resetToken = resetToken;
    user.resetTokenExpire = Date.now() + 10 * 60 * 1000; // 10 minutes
    await user.save();

    const link = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

    await sendEmail(
      user.email,
      "Reset Password - Servocci",
      `
        <h2>Password Reset Request</h2>
        <p>Click the link below to reset your password:</p>
        <a href="${link}" target="_blank" style="color:#4f46e5">${link}</a>
        <p>This link is valid for 10 minutes.</p>
      `
    );

    res.json({ msg: "Reset link sent to your email." });
  } catch (err) {
    console.error("Forgot Password Error:", err);
    res.status(500).json({ msg: "Server error" });
  }
});

/* -----------------------------------
   RESET PASSWORD
----------------------------------- */
router.post("/reset-password/:token", async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  try {
    const user =
      (await Student.findOne({ resetToken: token, resetTokenExpire: { $gt: Date.now() } })) ||
      (await Institution.findOne({ resetToken: token, resetTokenExpire: { $gt: Date.now() } }));

    if (!user) return res.status(400).json({ msg: "Invalid or expired token" });

    user.password = await bcrypt.hash(password, 10);
    user.resetToken = undefined;
    user.resetTokenExpire = undefined;

    await user.save();

    res.json({ msg: "Password reset successful" });
  } catch (err) {
    console.error("Reset Password Error:", err);
    res.status(500).json({ msg: "Server error" });
  }
});

export default router;
