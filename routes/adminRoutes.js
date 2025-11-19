// routes/adminRoutes.js
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
  try {
    const { name, email, phone, password } = req.body;
    if (!name || !email || !phone || !password) {
      return res.status(400).json({ msg: "Name, email, phone and password are required." });
    }

    const existing = await Student.findOne({ email });
    if (existing) return res.status(400).json({ msg: "Email already registered" });

    const existingPhone = await Student.findOne({ phone });
    if (existingPhone) return res.status(400).json({ msg: "Phone already registered" });

    const newUser = await Student.create({ name, email, phone, password }); // password will be hashed by pre('save')
    const safeUser = { id: newUser._id, name: newUser.name, email: newUser.email, phone: newUser.phone };

    res.status(201).json({ msg: "Student registered successfully", user: safeUser });
  } catch (err) {
    console.error("Register Student Error:", err);
    res.status(500).json({ msg: "Server error" });
  }
});

/* -----------------------------------
   INSTITUTION REGISTER
----------------------------------- */
router.post("/register-institution", async (req, res) => {
  try {
    const { name, email, phone, password, type, address, state, city, pincode } = req.body;
    if (!name || !email || !phone || !password || !type || !address) {
      return res.status(400).json({ msg: "Missing required institution fields." });
    }

    const existing = await Institution.findOne({ email });
    if (existing) return res.status(400).json({ msg: "Email already registered" });

    // hash password for Institution (schema doesn't auto-hash)
    const hashedPassword = await bcrypt.hash(password, 10);

    const newInst = await Institution.create({
      name,
      email,
      phone,
      password: hashedPassword,
      type,
      address,
      state,
      city,
      pincode,
      affiliation: req.body.affiliation || ""
    });

    const safeInst = {
      id: newInst._id,
      name: newInst.name,
      email: newInst.email,
      phone: newInst.phone,
      type: newInst.type,
    };

    res.status(201).json({ msg: "Institution registered successfully", institution: safeInst });
  } catch (err) {
    console.error("Register Institution Error:", err);
    res.status(500).json({ msg: "Server error" });
  }
});

/* -----------------------------------
   LOGIN (Student + Admin + Institution)
----------------------------------- */
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ msg: "Email and password required" });

    // Try Institution first
    let user = await Institution.findOne({ email });
    let role = null;

    if (user) {
      // compare hashed password
      const isValid = await bcrypt.compare(password, user.password);
      if (!isValid) return res.status(400).json({ msg: "Invalid credentials" });
      role = "institution";
      const token = generateToken({ id: user._id, email: user.email, role });
      return res.json({
        token,
        user: { id: user._id, name: user.name, email: user.email, phone: user.phone, role }
      });
    }

    // Try Student
    user = await Student.findOne({ email });
    if (!user) return res.status(400).json({ msg: "Invalid credentials" });

    const validStudent = await user.matchPassword(password);
    if (!validStudent) return res.status(400).json({ msg: "Invalid credentials" });
    role = user.isAdmin ? "admin" : "student";
    const token = generateToken({ id: user._id, email: user.email, role });

    return res.json({
      token,
      user: { id: user._id, name: user.name, email: user.email, phone: user.phone, role }
    });
  } catch (err) {
    console.error("Login Error:", err);
    return res.status(500).json({ msg: "Server error" });
  }
});

/* -----------------------------------
   OTP LOGIN (Firebase Verified Phone)
   NOTE: This endpoint assumes Firebase verification happened on client.
----------------------------------- */
router.post("/otp-login", async (req, res) => {
  try {
    const { phone } = req.body;
    if (!phone) return res.status(400).json({ msg: "Phone required" });

    let user = await Student.findOne({ phone });

    if (!user) {
      // create a placeholder user; password hashed by pre-save
      user = await Student.create({
        name: "User",
        phone,
        email: `${phone}@servocci.com`,
        password: crypto.randomBytes(12).toString("hex"),
      });
    }

    const token = generateToken({ id: user._id, phone: user.phone, role: "student" });

    return res.json({ token, user: { id: user._id, name: user.name, phone: user.phone, email: user.email } });
  } catch (err) {
    console.error("OTP Login Error:", err);
    res.status(500).json({ msg: "Server error" });
  }
});

/* -----------------------------------
   FORGOT PASSWORD (Resend Email)
----------------------------------- */
router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ msg: "Email required" });

    // find user in either collection
    let user = await Student.findOne({ email });
    let modelType = "student";
    if (!user) {
      user = await Institution.findOne({ email });
      modelType = user ? "institution" : null;
    }

    if (!user) return res.status(404).json({ msg: "Email not found" });

    const resetToken = crypto.randomBytes(32).toString("hex");
    user.resetToken = resetToken;
    user.resetTokenExpire = Date.now() + 10 * 60 * 1000;
    await user.save();

    const link = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

    await sendEmail(
      user.email,
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
    if (!password) return res.status(400).json({ msg: "New password required" });

    // Try Student first then Institution
    let user = await Student.findOne({ resetToken: token, resetTokenExpire: { $gt: Date.now() } });
    let model = "student";
    if (!user) {
      user = await Institution.findOne({ resetToken: token, resetTokenExpire: { $gt: Date.now() } });
      model = user ? "institution" : null;
    }

    if (!user) return res.status(400).json({ msg: "Invalid or expired token" });

    // If Student model, use schema pre-save hashing by setting password and saving.
    if (model === "student") {
      user.password = password; // will be hashed by pre('save')
    } else {
      // Institution schema doesn't auto hash, so hash manually
      user.password = await bcrypt.hash(password, 10);
    }

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
