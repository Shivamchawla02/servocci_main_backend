// controllers/contactController.js
import { Resend } from "resend";
import dotenv from "dotenv";

dotenv.config();

const resend = new Resend(process.env.RESEND_API_KEY);

export const sendContactEmail = async (req, res) => {
  const { name, email, subject, message } = req.body;

  // Basic validation
  if (!name || !email || !message) {
    return res.status(400).json({ msg: "Name, email, and message are required." });
  }

  try {
    // Send email to admin
    await resend.emails.send({
      from: `Servocci Website <shivam@servocci.com>`,
      to: "hello@servocci.com",
      subject: subject || "New Contact Message from Servocci Website",
      html: `
        <h2>New Contact Form Message</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Subject:</strong> ${subject || "N/A"}</p>
        <p><strong>Message:</strong><br>${message}</p>
      `,
    });

    // Optional: Confirmation email to user
    await resend.emails.send({
      from: "Servocci <shivam@servocci.com>",
      to: email,
      subject: "We received your message",
      html: `
        <p>Hello ${name},</p>
        <p>Thank you for contacting Servocci Counsellors. Our team will get back to you shortly.</p>
        <p>Best Regards,<br>Servocci Team</p>
      `,
    });

    return res.status(200).json({ msg: "Message sent successfully." });
  } catch (error) {
    console.error("Resend Email Error:", error);
    return res.status(500).json({ msg: "Failed to send message. Please try again later." });
  }
};
