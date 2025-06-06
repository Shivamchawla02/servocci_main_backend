import express from "express";
import bcrypt from "bcryptjs";  // bcryptjs is easier to work with in many environments
import jwt from "jsonwebtoken";
import Student from "../models/Student.js";

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret_here"; // Use env var in production

// REGISTER
router.post("/register", async (req, res) => {
  const { name, email, phone, password } = req.body;

  try {
    // Check if user already exists
    const existing = await Student.findOne({ email });
    if (existing) return res.status(400).json({ msg: "Email already registered" });

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create and save new student
    const newStudent = new Student({ name, email, phone, password: hashedPassword });
    await newStudent.save();

    return res.status(201).json({ msg: "Student registered successfully" });
  } catch (err) {
    console.error("Register error:", err);
    return res.status(500).json({ msg: "Server error" });
  }
});

// LOGIN
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    // Find user by email
    const student = await Student.findOne({ email });
    if (!student) return res.status(400).json({ msg: "Invalid email or password" });

    // Compare password
    const isMatch = await bcrypt.compare(password, student.password);
    if (!isMatch) return res.status(400).json({ msg: "Invalid email or password" });

    // Generate JWT token
    const token = jwt.sign({ id: student._id, email: student.email }, JWT_SECRET, { expiresIn: "1d" });

    // Respond with token and user info
    return res.json({
      token,
      user: {
        id: student._id,
        name: student.name,
        email: student.email,
        phone: student.phone,
      },
    });
  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({ msg: "Server error" });
  }
});

export default router;
