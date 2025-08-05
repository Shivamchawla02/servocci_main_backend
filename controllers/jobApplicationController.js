import JobApplication from "../models/JobApplication.js";
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export const saveJobApplication = async (req, res) => {
  try {
    const {
      fullName,
      email,
      resumeUrl,
      jobTitle,
      company,
      location,
      preferredDate,
      preferredTime,
    } = req.body;

    if (!fullName || !email || !resumeUrl || !jobTitle || !company) {
      return res.status(400).json({ message: "All required fields must be filled." });
    }

    const newApplication = new JobApplication({
      fullName,
      email,
      resumeUrl,
      jobTitle,
      company,
      location,
      preferredDate,
      preferredTime,
    });

    await newApplication.save();

    // Email to Admin
    await transporter.sendMail({
      from: `"Servocci Careers" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_USER,
      subject: `📩 New Application for ${jobTitle}`,
      html: `
        <h2>New Job Application</h2>
        <ul>
          <li><strong>Name:</strong> ${fullName}</li>
          <li><strong>Email:</strong> ${email}</li>
          <li><strong>Job:</strong> ${jobTitle} @ ${company}</li>
          <li><strong>Location:</strong> ${location || "N/A"}</li>
          <li><strong>Preferred Date:</strong> ${preferredDate || "Not specified"}</li>
          <li><strong>Preferred Time:</strong> ${preferredTime || "Not specified"}</li>
        </ul>
        <p><strong>Resume:</strong> <a href="${resumeUrl}" target="_blank">View Resume</a></p>
      `,
    });

    // Email to Applicant
    await transporter.sendMail({
      from: `"Servocci Careers" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: `✅ Application Received for ${jobTitle}`,
      html: `
        <h2>Hi ${fullName},</h2>
        <p>Thank you for applying to <strong>${company}</strong> for the role of <strong>${jobTitle}</strong>.</p>
        <p>We have received your application and will get back to you shortly.</p>
        <p>Regards, <br/> <strong>Servocci Careers Team</strong></p>
      `,
    });

    res.status(201).json({ message: "✅ Application saved and emails sent." });
  } catch (error) {
    console.error("❌ Error saving application:", error);
    res.status(500).json({ message: "Server error while saving application." });
  }
};
