// controllers/applicationController.js
import Application from "../models/Application.js";
import { Resend } from "resend";
import dotenv from "dotenv";

dotenv.config();

const resend = new Resend(process.env.RESEND_API_KEY);

export const createApplication = async (req, res) => {
  try {
    const {
      fullName,
      email,
      phone,
      course,
      classYear,
      reference,
      university,
    } = req.body;

    // 🔹 Basic validation
    if (!fullName || !email || !phone || !course || !university) {
      return res.status(400).json({
        success: false,
        message: "Required fields are missing",
      });
    }

    // 🔹 Save to MongoDB
    const application = new Application({
      fullName,
      email,
      phone,
      course,
      classYear,
      reference,
      university,
    });

    await application.save();

    /* ================= ADMIN EMAIL ================= */
    await resend.emails.send({
      from: "Servocci Website <shivam@servocci.com>",
      to: "hello@servocci.com",
      subject: `🎓 New Admission Application – ${university}`,
      html: `
        <h2>New Admission Application Received</h2>

        <p><strong>Full Name:</strong> ${fullName}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Phone:</strong> ${phone}</p>
        <p><strong>Course Applied:</strong> ${course}</p>
        <p><strong>Class / Year:</strong> ${classYear || "N/A"}</p>
        <p><strong>Reference:</strong> ${reference || "N/A"}</p>
        <p><strong>University:</strong> ${university}</p>

        <hr />
        <p>Submitted via: Servocci Counsellors Website</p>
      `,
    });

    /* ================= USER CONFIRMATION EMAIL ================= */
    await resend.emails.send({
      from: "Servocci Counsellors <shivam@servocci.com>",
      to: email,
      subject: "Your Application Has Been Received – Servocci Counsellors",
      html: `
        <p>Hello ${fullName},</p>

        <p>Thank you for applying through <strong>Servocci Counsellors</strong>.</p>

        <p>We have successfully received your application for:</p>

        <ul>
          <li><strong>Course:</strong> ${course}</li>
          <li><strong>University:</strong> ${university}</li>
        </ul>

        <p>Our counselling team will review your application and contact you shortly with the next steps.</p>

        <p>If you have any urgent queries, feel free to reply to this email or contact us directly.</p>

        <br />

        <p>
          Best Regards,<br />
          <strong>Team Servocci Counsellors</strong><br />
          +91-9958-21-9958 | +91-1141-61-8389
        </p>
      `,
    });

    return res.status(201).json({
      success: true,
      message: "Application submitted successfully",
    });
  } catch (error) {
    console.error("Application Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to submit application",
      error: error.message,
    });
  }
};
