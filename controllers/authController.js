import Student from "../models/Student.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import sendEmail from "../utils/sendEmail.js";
import crypto from "crypto";

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


    /* -------------------------------------------------------
       📧 SEND WELCOME EMAIL TO USER — (Updated with signature)
    --------------------------------------------------------- */
    await sendEmail(
      email,
      "Welcome to Servocci!",
      `
        <p>Hello ${name},</p>
        <p>Your student account has been created successfully on Servocci.</p>
        <p>You can now log in and access your dashboard anytime.</p>

        <br>
        <p>This is to formally acknowledge that your registration is complete.</p>
        <p>For any help, clarification, or next steps, feel free to contact us.</p>

        <br>
        <p>Regards,<br/>
        Malik Praveen<br/>
        Director, Servocci Counsellors<br/>
        9811272387</p>
      `
    );


    /* -------------------------------------------------------
       📧 SEND ADMIN ALERT — (Updated with signature)
    --------------------------------------------------------- */
    await sendEmail(
      "hello@servocci.com",
      "New Student Registered",
      `
        <h2>New Student Registration</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Phone:</strong> ${phone}</p>

        <hr>
        <p>Registration received via Servocci Counsellors website.</p>

        <p>Regards,<br/>
        Malik Praveen<br/>
        Director, Servocci Counsellors<br/>
        9811272387</p>
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

    // 🚀 NON-BLOCKING LOGIN EMAIL
    try {
      sendEmail(
        student.email,
        "New Login to Your Servocci Account",
        `<p>Hello ${student.name},</p>
         <p>You have successfully logged in to your Servocci account. If this wasn't you, please change your password immediately.</p>`
      );

      sendEmail(
        "hello@servocci.com",
        "User Logged In",
        `<p>User logged in: ${student.name} (${student.email})</p>`
      );
    } catch (err) {
      console.error("Login email error:", err);
    }

    // SUCCESS RESPONSE
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
    if (!student) return res.status(404).json({ success: false, message: "Email not found" });

    const resetToken = crypto.randomBytes(32).toString("hex");
    student.resetToken = resetToken;
    student.resetTokenExpire = Date.now() + 10 * 60 * 1000;
    await student.save();

    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
    await sendEmail(email, "Reset Your Password", `<p>Click here: <a href="${resetUrl}">${resetUrl}</a></p>`);

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
