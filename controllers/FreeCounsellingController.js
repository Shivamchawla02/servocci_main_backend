import FreeCounsellingRequest from "../models/FreeCounsellingRequest.js";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export const createBooking = async (req, res) => {
  try {
    const { name, phone, email, preferredDate, preferredTime, message, course } = req.body;

    if (!name || !phone || !preferredDate || !preferredTime) {
      return res.status(400).json({ msg: "Name, phone, preferred date, and preferred time are required." });
    }

    // Save to DB
    const newBooking = new FreeCounsellingRequest({
      name,
      phone,
      email,
      preferredDate,
      preferredTime,
      message,
      course
    });
    await newBooking.save();

    // Send user email (if email provided)
    if (email) {
      await resend.emails.send({
        from: "Servocci Counsellors <noreply@servocci.com>",
        to: email,
        subject: "Thank you for booking your free counselling session",
        html: `
          <p>Hi ${name},</p>
          <p>Thank you for booking a free career counselling session with us. Our team will contact you soon.</p>
          <p><strong>Details:</strong><br/>
          Phone: ${phone}<br/>
          Preferred Date: ${preferredDate}<br/>
          Preferred Time: ${preferredTime}<br/>
          Course: ${course || 'N/A'}<br/>
          Message: ${message || 'N/A'}</p>
          <p>Best regards,<br/>Servocci Counsellors</p>
        `
      });
    }

    // Send admin email
    await resend.emails.send({
      from: "Servocci Counsellors <noreply@servocci.com>",
      to: "hello@servocci.com",
      subject: "New Free Counselling Booking",
      html: `
        <p>A new free counselling request has been submitted:</p>
        <p><strong>Name:</strong> ${name}<br/>
        <strong>Phone:</strong> ${phone}<br/>
        <strong>Email:</strong> ${email || 'N/A'}<br/>
        <strong>Preferred Date:</strong> ${preferredDate}<br/>
        <strong>Preferred Time:</strong> ${preferredTime}<br/>
        <strong>Course:</strong> ${course || 'N/A'}<br/>
        <strong>Message:</strong> ${message || 'N/A'}</p>
      `
    });

    return res.status(201).json({ msg: "Your free counselling request has been submitted successfully." });

  } catch (err) {
    console.error("FreeCounselling create error:", err);
    return res.status(500).json({ msg: "Server error" });
  }
};
