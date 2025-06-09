import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import Student from "../models/Student.js";
import Institution from "../models/Institution.js";

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret_here";

// --- STUDENT REGISTER ---
router.post("/register", async (req, res) => {
  const { name, email, phone, password } = req.body;

  try {
    const existing = await Student.findOne({ email });
    if (existing) return res.status(400).json({ msg: "Email already registered" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const newStudent = new Student({ name, email, phone, password: hashedPassword });
    await newStudent.save();

    return res.status(201).json({ msg: "Student registered successfully" });
  } catch (err) {
    console.error("Register error:", err);
    return res.status(500).json({ msg: "Server error" });
  }
});

// --- STUDENT LOGIN ---
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const student = await Student.findOne({ email });
    if (!student) return res.status(400).json({ msg: "Invalid email or password" });

    const isMatch = await bcrypt.compare(password, student.password);
    if (!isMatch) return res.status(400).json({ msg: "Invalid email or password" });

    const token = jwt.sign({ id: student._id, email: student.email }, JWT_SECRET, { expiresIn: "1d" });

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

// --- INSTITUTION REGISTER ---
router.post("/register-institution", async (req, res) => {
  const {
    name,
    type,
    affiliation,
    address,
    state,
    city,
    pincode,
    phone,
    email,
    password,
  } = req.body;

  try {
    const existing = await Institution.findOne({ email });
    if (existing) return res.status(400).json({ msg: "Email already registered" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const newInstitution = new Institution({
      name,
      type,
      affiliation,
      address,
      state,
      city,
      pincode,
      phone,
      email,
      password: hashedPassword,
    });
    await newInstitution.save();

    return res.status(201).json({ msg: "Institution registered successfully" });
  } catch (err) {
    console.error("Institution Register error:", err);
    return res.status(500).json({ msg: "Server error" });
  }
});

// --- INSTITUTION LOGIN ---
router.post("/login-institution", async (req, res) => {
  const { email, password } = req.body;

  try {
    const institution = await Institution.findOne({ email });
    if (!institution) return res.status(400).json({ msg: "Invalid email or password" });

    const isMatch = await bcrypt.compare(password, institution.password);
    if (!isMatch) return res.status(400).json({ msg: "Invalid email or password" });

    const token = jwt.sign({ id: institution._id, email: institution.email }, JWT_SECRET, { expiresIn: "1d" });

    return res.json({
      token,
      user: {
        id: institution._id,
        name: institution.name,
        email: institution.email,
        phone: institution.phone,
        type: institution.type,
      },
    });
  } catch (err) {
    console.error("Institution Login error:", err);
    return res.status(500).json({ msg: "Server error" });
  }
});

export default router;
