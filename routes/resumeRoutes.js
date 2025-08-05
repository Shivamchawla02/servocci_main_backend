import express from "express";
import Resume from "../models/Resume.js";
import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config(); // Load .env variables

const router = express.Router();

// ✅ Nodemailer transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

/**
 * ✅ Save resume & send emails
 * POST /api/resumes/save-resume
 */
router.post("/save-resume", async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      qualification,
      educationLevel,
      yearOfPassing,
      experience,
      resumeUrl,
    } = req.body;

    // Basic validation
    if (
      !name ||
      !email ||
      !phone ||
      !qualification ||
      !educationLevel ||
      !yearOfPassing ||
      !experience ||
      !resumeUrl
    ) {
      return res.status(400).json({ message: "All fields are required." });
    }

    // Save to DB
    const newResume = new Resume({
      name,
      email,
      phone,
      qualification,
      educationLevel,
      yearOfPassing,
      experience,
      resumeUrl,
    });

    await newResume.save();

    // ✉️ Email to Admin
    await transporter.sendMail({
      from: `"Servocci Resume Bot" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_USER,
      subject: `📥 New Resume Submission from ${name}`,
      html: `
        <h2>New Resume Submitted</h2>
        <ul>
          <li><strong>Name:</strong> ${name}</li>
          <li><strong>Email:</strong> ${email}</li>
          <li><strong>Phone:</strong> ${phone}</li>
          <li><strong>Qualification:</strong> ${qualification}</li>
          <li><strong>Education Level:</strong> ${educationLevel}</li>
          <li><strong>Year of Passing:</strong> ${yearOfPassing}</li>
          <li><strong>Experience:</strong> ${experience} years</li>
        </ul>
        <p><strong>Resume:</strong> <a href="${resumeUrl}" target="_blank">View Resume</a></p>
        <hr/>
        <p>This is an automated email from <strong>Servocci.com</strong>.</p>
      `,
    });

    // ✉️ Confirmation Email to Applicant
    await transporter.sendMail({
      from: `"Servocci Counsellors" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "✅ Resume Received by Servocci",
      html: `
        <h2>Hi ${name},</h2>
        <p>Thank you for submitting your resume to <strong>Servocci Counsellors</strong>.</p>
        <p>Our team has successfully received your details and will contact you soon if an opportunity matches your profile.</p>
        <br/>
        <p><strong>Submission Details:</strong></p>
        <ul>
          <li><strong>Phone:</strong> ${phone}</li>
          <li><strong>Qualification:</strong> ${qualification}</li>
          <li><strong>Education Level:</strong> ${educationLevel}</li>
          <li><strong>Year of Passing:</strong> ${yearOfPassing}</li>
          <li><strong>Experience:</strong> ${experience} years</li>
        </ul>
        <br/>
        <p>We appreciate your interest in working with us.</p>
        <p>Best wishes,</p>
        <p><strong>Team Servocci</strong></p>
        <hr/>
        <small>This is an automated message. Please do not reply.</small>
      `,
    });

    res.status(201).json({ message: "✅ Resume saved and emails sent." });
  } catch (error) {
    console.error("❌ Error saving resume or sending emails:", error);
    res.status(500).json({ message: "Server error while saving resume." });
  }
});

/**
 * ✅ Get all resumes (for admin dashboard)
 * GET /api/resumes
 */
router.get("/", async (req, res) => {
  try {
    const resumes = await Resume.find().sort({ createdAt: -1 });
    res.json(resumes);
  } catch (error) {
    console.error("❌ Error fetching resumes:", error);
    res.status(500).json({ message: "Server error while fetching resumes." });
  }
});

export default router;
