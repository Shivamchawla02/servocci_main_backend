import Student from "../models/Student.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import sendEmail from "../utils/sendEmail.js";

const JWT_SECRET = process.env.JWT_SECRET;

// =========================
// LOGIN STUDENT
// =========================
export const loginStudent = async (req, res) => {
  const { email, password } = req.body;

  try {
    const student = await Student.findOne({ email });
    if (!student)
      return res.status(400).json({ message: "Invalid email or password" });

    const isMatch = await bcrypt.compare(password, student.password);
    if (!isMatch)
      return res.status(400).json({ message: "Invalid email or password" });

    const token = jwt.sign(
      { id: student._id, email: student.email },
      JWT_SECRET,
      { expiresIn: "1d" }
    );

    return res.json({
      token,
      user: {
        id: student._id,
        name: student.name,
        email: student.email,
        phone: student.phone,
        isAdmin: student.isAdmin,
      },
    });
  } catch (err) {
    return res
      .status(500)
      .json({ message: "Server error", error: err.message });
  }
};

// =========================
// REGISTER STUDENT
// =========================
export const registerStudent = async (req, res) => {
  const { name, email, phone, password } = req.body;

  try {
    // Check if email exists
    const existing = await Student.findOne({ email });
    if (existing)
      return res.status(400).json({ message: "Email already exists" });

    // Create student (NO manual hashing — model pre-save will hash)
    const newStudent = new Student({
      name,
      email,
      phone,
      password, // raw password → pre-save hook will hash
    });

    await newStudent.save();

    // 📧 Send welcome email
    await sendEmail(
      email,
      "Welcome to Servocci!",
      `
        <p>Hello ${name},</p>
        <p>Your student account has been created successfully.</p>
        <p>Login anytime and continue your admission journey.</p>
        <br/>
        <p>Regards,<br/>Team Servocci</p>
      `
    );

    return res
      .status(201)
      .json({ message: "Student registered successfully" });
  } catch (err) {
    return res
      .status(500)
      .json({ message: "Server error", error: err.message });
  }
};
