import express from "express";
import Subscription from "../models/Subscription.js";
import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();
const router = express.Router();

/* ----------------------------------------------------------
   ✅ Step 1: Setup Hostinger SMTP Transporter
---------------------------------------------------------- */
const transporter = nodemailer.createTransport({
  host: "smtp.hostinger.com", // Hostinger SMTP
  port: 465,
  secure: true, // true for port 465
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Optional: Verify SMTP connection on startup
transporter.verify((error, success) => {
  if (error) {
    console.error("❌ SMTP connection failed:", error);
  } else {
    console.log("✅ SMTP server is ready to send emails");
  }
});

/* ----------------------------------------------------------
   ✅ Step 2: Utility to Send Emails
---------------------------------------------------------- */
const sendEmail = async (to, subject, html) => {
  try {
    await transporter.sendMail({
      from: `"Servocci e-Skills" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
    });
  } catch (error) {
    console.error("❌ Email sending failed:", error);
  }
};

/* ----------------------------------------------------------
   🧑‍🎓 Student Subscription Route
---------------------------------------------------------- */
router.post("/student", async (req, res) => {
  try {
    const newSub = new Subscription({ ...req.body, type: "student" });
    await newSub.save();

    // ✅ Admin Notification Email
    await sendEmail(
      "hello@servocci.com",
      "🎓 New Student Subscription - Servocci e-Skills",
      `
      <div style="font-family: Arial, sans-serif; color: #333;">
        <h2 style="color:#001b48;">New Student Subscription</h2>
        <p><b>Name:</b> ${req.body.name}</p>
        <p><b>Email:</b> ${req.body.email}</p>
        <p><b>Phone:</b> ${req.body.phone}</p>
        <p><b>Grade:</b> ${req.body.grade}</p>
        <p><b>School:</b> ${req.body.school || "N/A"}</p>
        <p><b>Exam:</b> ${req.body.exam || "N/A"}</p>
        <p><b>Remarks:</b> ${req.body.remarks || "N/A"}</p>
        <hr/>
        <p>Received via Servocci e-Skills Subscription Form</p>
      </div>
      `
    );

    // ✅ Confirmation Email to Student
    await sendEmail(
      req.body.email,
      "Welcome to Servocci e-Skills!",
      `
      <div style="font-family: Arial, sans-serif; color: #333;">
        <h2 style="color:#ff4f00;">Welcome, ${req.body.name} 🎉</h2>
        <p>Thank you for subscribing to <b>Servocci e-Skills</b>!</p>
        <p>We’re excited to have you in our learning community. Expect insights, updates, and opportunities straight to your inbox.</p>
        <br/>
        <p>Warm regards,</p>
        <p><b>The Servocci Team</b></p>
        <a href="https://servocci.com" style="color:#001b48;">servocci.com</a>
      </div>
      `
    );

    res.status(201).json({ message: "Student subscribed successfully!" });
  } catch (error) {
    console.error("Error saving student subscription:", error);
    res
      .status(500)
      .json({ message: "Error saving student subscription", error });
  }
});

/* ----------------------------------------------------------
   🏫 Institution Subscription Route
---------------------------------------------------------- */
router.post("/institution", async (req, res) => {
  try {
    const newSub = new Subscription({ ...req.body, type: "institution" });
    await newSub.save();

    // ✅ Admin Notification Email
    await sendEmail(
      "hello@servocci.com",
      "🏫 New Institution Subscription - Servocci e-Skills",
      `
      <div style="font-family: Arial, sans-serif; color: #333;">
        <h2 style="color:#001b48;">New Institution Subscription</h2>
        <p><b>Type:</b> ${req.body.type}</p>
        <p><b>Name:</b> ${req.body.name}</p>
        <p><b>Contact Person:</b> ${req.body.contactPerson}</p>
        <p><b>Email:</b> ${req.body.email}</p>
        <p><b>Phone:</b> ${req.body.phone}</p>
        <p><b>Address:</b> ${req.body.address}</p>
        <p><b>Remarks:</b> ${req.body.remarks || "N/A"}</p>
        <hr/>
        <p>Received via Servocci e-Skills Subscription Form</p>
      </div>
      `
    );

    // ✅ Confirmation Email to Institution
    await sendEmail(
      req.body.email,
      "Welcome to Servocci e-Skills (Institution Partner)",
      `
      <div style="font-family: Arial, sans-serif; color: #333;">
        <h2 style="color:#001b48;">Hello ${req.body.contactPerson || "Team"},</h2>
        <p>Thank you for subscribing your <b>${req.body.type}</b> <b>${req.body.name}</b> to <b>Servocci e-Skills</b>.</p>
        <p>We look forward to collaborating for your institution’s skill development and educational growth.</p>
        <br/>
        <p>Warm regards,</p>
        <p><b>The Servocci Team</b></p>
        <a href="https://servocci.com" style="color:#ff4f00;">servocci.com</a>
      </div>
      `
    );

    res.status(201).json({ message: "Institution subscribed successfully!" });
  } catch (error) {
    console.error("Error saving institution subscription:", error);
    res
      .status(500)
      .json({ message: "Error saving institution subscription", error });
  }
});

export default router;
