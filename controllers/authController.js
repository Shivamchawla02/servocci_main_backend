// controllers/authController.js
import Student from "../models/Student.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import nodemailer from "nodemailer";

export const register = async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;
    const existingUser = await Student.findOne({ email });
    if (existingUser) return res.status(400).json({ msg: "Email already registered" });

    const user = new Student({ name, email, phone, password });
    await user.save();

    res.status(201).json({ msg: "Registration successful", user });
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await Student.findOne({ email });
    if (!user) return res.status(400).json({ msg: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ msg: "Invalid credentials" });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });
    res.json({ msg: "Login successful", token, user });
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};

// ========== FORGOT PASSWORD ==========
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await Student.findOne({ email });
    if (!user) return res.status(400).json({ msg: "No account with this email" });

    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetTokenExpire = Date.now() + 10 * 60 * 1000;
    user.resetToken = resetToken;
    user.resetTokenExpire = resetTokenExpire;
    await user.save();

    const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;

    // ✅ Nodemailer setup directly here
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const html = `
      <h2>Reset Your Password</h2>
      <p>Click the button below to reset your password. This link will expire in 10 minutes.</p>
      <a href="${resetUrl}" style="display:inline-block;padding:10px 20px;background:#001b48;color:#fff;text-decoration:none;border-radius:5px;">Reset Password</a>
      <p>If you didn’t request this, please ignore this email.</p>
    `;

    await transporter.sendMail({
      from: `"Servocci Counsellors" <${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: "Password Reset Link - Servocci Counsellors",
      html,
    });

    res.json({ msg: "Password reset link sent to email" });
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};

// ========== RESET PASSWORD ==========
export const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    const user = await Student.findOne({
      resetToken: token,
      resetTokenExpire: { $gt: Date.now() },
    });
    if (!user) return res.status(400).json({ msg: "Invalid or expired token" });

    const hashedPassword = await bcrypt.hash(password, 10);
    user.password = hashedPassword;
    user.resetToken = undefined;
    user.resetTokenExpire = undefined;
    await user.save();

    res.json({ msg: "Password reset successful" });
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};
