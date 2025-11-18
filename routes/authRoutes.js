import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import Student from "../models/student.js";
import Institution from "../models/Institution.js";
import sendEmail from "../utils/sendEmail.js";

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret_here";

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
    if (existing) return res.status(400).json({ msg: "Email already registered" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await Student.create({ name, email, phone, password: hashedPassword });

    res.status(201).json({ msg: "Student registered successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
});

/* -----------------------------------
   INSTITUTION REGISTER
----------------------------------- */
router.post("/register-institution", async (req, res) => {
  try {
    const existing = await Institution.findOne({ email: req.body.email });
    if (existing) return res.status(400).json({ msg: "Email already registered" });

    const hashedPassword = await bcrypt.hash(req.body.password, 10);

    await Institution.create({
      ...req.body,
      password: hashedPassword,
    });

    res.status(201).json({ msg: "Institution registered successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
});

/* -----------------------------------
   LOGIN (Student + Admin + Institution)
----------------------------------- */
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    let user = null;
    let role = null;

    // 1️⃣ Check Institution first
    user = await Institution.findOne({ email });
    if (user) role = "institution";

    // 2️⃣ Check Student
    if (!user) {
      user = await Student.findOne({ email });
      if (user) role = user.isAdmin ? "admin" : "student";
    }

    if (!user) return res.status(400).json({ msg: "Invalid credentials" });

    // 3️⃣ Verify password
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(400).json({ msg: "Invalid credentials" });

    // 4️⃣ Create Token
    const token = generateToken({
      id: user._id,
      email: user.email,
      role,
    });

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
    console.error(err);
    return res.status(500).json({ msg: "Server error" });
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

    return res.json({ token, user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
});

/* -----------------------------------
   FORGOT PASSWORD
----------------------------------- */
router.post("/forgot-password", async (req, res) => {
  try {
    const user =
      (await Student.findOne({ email: req.body.email })) ||
      (await Institution.findOne({ email: req.body.email }));

    if (!user) return res.status(404).json({ msg: "Email not found" });

    const resetToken = crypto.randomBytes(32).toString("hex");
    user.resetToken = resetToken;
    user.resetTokenExpire = Date.now() + 10 * 60 * 1000;
    await user.save();

    const link = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
    await sendEmail(user.email, "Reset Password", `Reset link: ${link}`);

    res.json({ msg: "Reset link sent" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
});

/* -----------------------------------
   RESET PASSWORD
----------------------------------- */
router.post("/reset-password/:token", async (req, res) => {
  try {
    const user =
      (await Student.findOne({
        resetToken: req.params.token,
        resetTokenExpire: { $gt: Date.now() },
      })) ||
      (await Institution.findOne({
        resetToken: req.params.token,
        resetTokenExpire: { $gt: Date.now() },
      }));

    if (!user) return res.status(400).json({ msg: "Invalid or expired token" });

    user.password = await bcrypt.hash(req.body.password, 10);
    user.resetToken = undefined;
    user.resetTokenExpire = undefined;
    await user.save();

    res.json({ msg: "Password reset successful" });
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
});

export default router;
