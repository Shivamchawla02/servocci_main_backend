import Student from "../models/Student.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import sendEmail from "../utils/sendEmail.js";
import crypto from "crypto";
import LoginLog from "../models/LoginLog.js";

const JWT_SECRET = process.env.JWT_SECRET;

// Generate JWT
const generateToken = (id) => {
  return jwt.sign({ id }, JWT_SECRET, { expiresIn: "7d" });
};

// 🔗 Global Email Header + Footer
const emailWrapper = (content) => {
  return `
    <div style="max-width:700px;margin:0 auto;padding:25px;
         font-family:Arial,Helvetica,sans-serif;
         border:1px solid #eee;border-radius:8px;">
      
      <div style="text-align:center;margin-bottom:20px;">
        <img src="https://res.cloudinary.com/dhpm7jmyy/image/upload/v1764674835/logoblackk_b8bazl.png"
             alt="Servocci Logo"
             style="width:160px;margin-bottom:10px;" />
      </div>

      ${content}

      <hr style="margin:40px 0;border:0;border-top:1px solid #e0e0e0;">

      <div style="text-align:center;color:#555;font-size:14px;line-height:1.6;">
        <p><strong>Servocci Counsellors</strong></p>
        <p>
          +91-9958-21-9958 | +91-1141-61-8389<br/>
          hello@servocci.com | support@servocci.com
        </p>
        <p style="font-size:12px;color:#888;">
          © ${new Date().getFullYear()} Servocci. All rights reserved.
        </p>
      </div>
    </div>
  `;
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

    // 📧 Welcome Email to User
    await sendEmail(
      email,
      "Welcome to Servocci Counsellors!",
      emailWrapper(`
        <p>Hello ${name},</p>
        <p>Your student account has been created successfully on <strong>Servocci Counsellors</strong>.</p>
        <p>You can now log in anytime and access your dashboard.</p>

        <p>This email confirms that your registration is successfully completed.</p>
        <p>If you need any assistance, feel free to reach out to us.</p>
      `)
    );

    // 📧 Admin Notification
    await sendEmail(
      "hello@servocci.com",
      "New Student Registered – Servocci Counsellors",
      emailWrapper(`
        <h2>New Student Registration</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Phone:</strong> ${phone}</p>
        <hr/>
        <p>Registration received via Servocci Counsellors website.</p>
      `)
    );

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
    res.status(500).json({ success: false, message: "Server error" });
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

    const token = generateToken(student._id);

    // 📌 Save login log
    await LoginLog.create({
      userId: student._id,
      name: student.name,
      email: student.email,
      ip: req.ip,
      userAgent: req.headers["user-agent"],
    });

    // 🚀 Send Login Emails (non-blocking)
    try {
      sendEmail(
        student.email,
        "New Login to Your Servocci Account",
        emailWrapper(`
          <p>Hello ${student.name},</p>
          <p>You have successfully logged in to your <strong>Servocci Counsellors</strong> account.</p>
          <p>If this wasn't you, please reset your password immediately.</p>
        `)
      );

      sendEmail(
        "hello@servocci.com",
        "Student Logged In – Servocci Counsellors",
        emailWrapper(`
          <p><strong>${student.name}</strong> just logged in.</p>
          <p>Email: ${student.email}</p>
        `)
      );
    } catch (err) {
      console.error("Login email error:", err);
    }

    return res.json({
      success: true,
      token,
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
    res.status(500).json({ success: false, message: "Server error" });
  }
};

/* ================================
   FORGOT PASSWORD
================================= */
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const student = await Student.findOne({ email });
    if (!student)
      return res.status(404).json({ success: false, message: "Email not found" });

    const resetToken = crypto.randomBytes(32).toString("hex");
    student.resetToken = resetToken;
    student.resetTokenExpire = Date.now() + 10 * 60 * 1000;
    await student.save();

    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

    await sendEmail(
      email,
      "Reset Your Password – Servocci Counsellors",
      emailWrapper(`
        <p>You requested a password reset.</p>
        <p>Click the link below to reset your password:</p>
        <p><a href="${resetUrl}" target="_blank">${resetUrl}</a></p>
      `)
    );

    res.json({ success: true, message: "Reset link sent to email" });

  } catch (err) {
    console.error("Forgot Password Error:", err);
    res.status(500).json({ success: false, message: "Server error" });
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

    if (!student)
      return res.status(400).json({ success: false, message: "Invalid or expired token" });

    student.password = req.body.password;
    student.resetToken = undefined;
    student.resetTokenExpire = undefined;
    await student.save();

    res.json({ success: true, message: "Password reset successful" });

  } catch (err) {
    console.error("Reset error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

/* ================================
   GET PROFILE
================================= */
export const getProfile = async (req, res) => {
  try {
    const student = await Student.findById(req.user.id).select("-password");
    res.json({ success: true, student });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};
