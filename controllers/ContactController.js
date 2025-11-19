import { Resend } from "resend";
import dotenv from "dotenv";

dotenv.config();

const resend = new Resend(process.env.RESEND_API_KEY);

export const sendContactEmail = async (req, res) => {
  const { name, email, subject, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({ msg: "All required fields must be filled." });
  }

  try {
    await resend.emails.send({
      from: `Servocci Website <shivam@servocci.com>`, 
      to: "hello@servocci.com", // Admin receives the details
      subject: subject || "New Contact Message from Servocci Website",
      html: `
        <h3>New Contact Form Message</h3>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Subject:</strong> ${subject || "N/A"}</p>
        <p><strong>Message:</strong><br>${message}</p>
      `,
    });

    // OPTIONAL: Send confirmation to user
    await resend.emails.send({
      from: "Servocci <shivam@servocci.com>",
      to: email,
      subject: "We received your message",
      html: `
        <p>Hello ${name},</p>
        <p>Thank you for contacting us. Our team will get back to you shortly.</p>
        <p>Regards,<br>Servocci Team</p>
      `,
    });

    res.status(200).json({ msg: "Message sent successfully." });
  } catch (error) {
    console.error("Email Error:", error);
    res.status(500).json({ msg: "Failed to send message." });
  }
};
