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

/* ================================
   REGISTER STUDENT
================================= */
export const registerStudent = async (req, res) => {
  try {
    const { name, email, phone, password, subscribedToEMagazine } = req.body;

    if (!name || !email || !phone || !password)
      return res.status(400).json({ success: false, message: "All fields are required" });

    const existingEmail = await Student.findOne({ email });
    if (existingEmail)
      return res.status(400).json({ success: false, message: "Email already exists" });

    const existingPhone = await Student.findOne({ phone });
    if (existingPhone)
      return res.status(400).json({ success: false, message: "Phone already exists" });

    // SAVE WITH E-MAGAZINE BOOLEAN
    const student = await Student.create({
      name,
      email,
      phone,
      password,
      subscribedToEMagazine: subscribedToEMagazine || false,
    });

    /* -------------------------------------------------------
       📧 SEND WELCOME EMAIL
    --------------------------------------------------------- */
    await sendEmail(
      email,
      "Welcome to Servocci Counsellors!",
      `
        <p>Hello ${name},</p>
        <p>Your student account has been created successfully on <strong>Servocci Counsellors</strong>.</p>
        <p>You can now log in anytime and access your dashboard.</p>

        <br>
        <p>If you need any assistance, feel free to reach out.</p>

        <br>
        <p>Best Regards,<br/>
        Team Servocci Counsellors<br/>
        +91-9958-21-9958 | +91-1141-61-8389<br/>
        support@servocci.com
        </p>
      `
    );

    /* -------------------------------------------------------
       📘 IF USER CHECKED THE "E-MAGAZINE SUBSCRIBE" CHECKBOX
       SEND E-MAGAZINE EMAIL IMMEDIATELY
    --------------------------------------------------------- */
    if (subscribedToEMagazine === true) {
      await sendEmail(
        email,
        "Subscription Successful – Servocci Career Guidance",
        `
        <div style="font-family: Arial; line-height: 1.6;">
          <h2>🎉 Thank you for subscribing, ${name}!</h2>
          <p>You are now subscribed to Servocci career updates.</p>
          <p>We will send you:</p>
          <ul>
            <li>Career guidance resources</li>
            <li>Exam & admission updates</li>
            <li>Important opportunities based on your grade</li>
          </ul>

          <br/>
          <h3>📘 Your Free E-Magazine</h3>
          <p>Click below to instantly download your E-Magazine:</p>

          <p>
            <a href="https://res.cloudinary.com/dhpm7jmyy/image/upload/v1763554640/Binder1_1__compressed_pv5cfc.pdf"
               style="display: inline-block; padding: 10px 16px; background: #ff4f00; color: #fff; text-decoration: none; border-radius: 6px;">
               📥 Download E-Magazine
            </a>
          </p>

          <br>
          <p>Best Regards<br/>
          Team Servocci Counsellors<br/>
          +91-9958-21-9958 | +91-1141-61-8389<br/>
          </p>
        </div>
        `
      );

      // ADMIN ALERT
      await sendEmail(
        "hello@servocci.com",
        "New E-Magazine Subscriber – Servocci Counsellors",
        `
          <h3>New Magazine Subscription</h3>
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
        `
      );
    }

    /* -------------------------------------------------------
       📧 ADMIN ALERT FOR NEW USER
    --------------------------------------------------------- */
    await sendEmail(
      "hello@servocci.com",
      "New Student Registered – Servocci Counsellors",
      `
        <h2>New Student Registration</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Phone:</strong> ${phone}</p>
      `
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
        subscribedToEMagazine: student.subscribedToEMagazine,
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

    // 📌 Log login details
    await LoginLog.create({
      userId: student._id,
      name: student.name,
      email: student.email,
      ip: req.ip,
      userAgent: req.headers["user-agent"],
    });

    // SEND LOGIN EMAIL (non-blocking)
    try {
      sendEmail(
        student.email,
        "New Login to Your Servocci Counsellors Account",
        `
          <p>Hello ${student.name},</p>
          <p>You have successfully logged in to your <strong>Servocci Counsellors</strong> account.</p>
          <p>If this was not you, please reset your password immediately.</p>
        `
      );

      sendEmail(
        "hello@servocci.com",
        "Student Logged In – Servocci Counsellors",
        `
          <p>User logged in:</p>
          <p><strong>${student.name}</strong> (${student.email})</p>
        `
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
        subscribedToEMagazine: student.subscribedToEMagazine,
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
    if (!student) return res.status(404).json({ success: false, message: "Email not found" });

    const resetToken = crypto.randomBytes(32).toString("hex");
    student.resetToken = resetToken;
    student.resetTokenExpire = Date.now() + 10 * 60 * 1000;
    await student.save();

    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

    await sendEmail(
      email,
      "Reset Your Password – Servocci Counsellors",
      `
        <p>You requested a password reset for your Servocci Counsellors account.</p>
        <p>Click here: <a href="${resetUrl}">${resetUrl}</a></p>
      `
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

    if (!student) return res.status(400).json({ success: false, message: "Invalid or expired token" });

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
