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

    <hr>
    <p>Submitted via: Servocci Counsellors Website</p>

  `,
});


    // Optional: Confirmation email to user
    // Confirmation email to user
await resend.emails.send({
  from: "Servocci <shivam@servocci.com>",
  to: email,
  subject: "We received your message",
  html: `
    <p>Hello ${name},</p>

    <p>This is to formally acknowledge that we have successfully received your message.</p>
    <p>We are available to discuss any further information, clarification, or next steps as required.</p>
    <p>Please feel free to contact us at your convenience.</p>

    <p>Thank you for reaching out to us.</p>

      <br>
      <p>Best Regards<br/>
      Team Servocci Counsellors<br/>
      +91-9958-21-9958 | +91-1141-61-8389<br/>
      </p>
  `,
});


    return res.status(200).json({ msg: "Message sent successfully." });
  } catch (error) {
    console.error("Resend Email Error:", error);
    return res.status(500).json({ msg: "Failed to send message. Please try again later." });
  }
};
