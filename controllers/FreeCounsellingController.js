import FreeCounsellingRequest from "../models/FreeCounsellingRequest.js";
import nodemailer from "nodemailer";

export const createBooking = async (req, res) => {
  try {
    const { name, phone, email, preferredDate, message } = req.body;

    if (!name || !phone || !preferredDate) {
      return res.status(400).json({ msg: "Name, phone, and preferred date are required." });
    }

    const newBooking = new FreeCounsellingRequest({
      name,
      phone,
      email,
      preferredDate,
      message
    });


    await newBooking.save();

    // === Nodemailer setup ===
    const transporter = nodemailer.createTransport({
      service: "gmail",  // or another service like Outlook, Zoho, etc.
      auth: {
        user: process.env.EMAIL_USER,  // your email address
        pass: process.env.EMAIL_PASS   // your app password or actual password
      }
    });

    // 📩 Email to user
    if (email) {
      await transporter.sendMail({
        from: `"Servocci Counsellors" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: "Thank you for booking your free counselling session",
        html: `
          <p>Hi ${name},</p>
          <p>Thank you for booking a free career counselling session with us. Our team will contact you soon.</p>
          <p><strong>Details:</strong><br/>
          Phone: ${phone}<br/>
          Preferred Date: ${preferredDate}<br/>
          Message: ${message || 'N/A'}</p>
          <p>Best regards,<br/>Servocci Counsellors</p>
        `
      });
    }

    // 📩 Email to your institution
    await transporter.sendMail({
      from: `"Servocci Counsellors" <${process.env.EMAIL_USER}>`,
      to: "info@servocci.com",  // your institution email
      subject: "New Free Counselling Booking",
      html: `
        <p>A new free counselling request has been submitted:</p>
        <p><strong>Name:</strong> ${name}<br/>
        <strong>Phone:</strong> ${phone}<br/>
        <strong>Email:</strong> ${email || 'N/A'}<br/>
        <strong>Preferred Date:</strong> ${preferredDate}<br/>
        <strong>Message:</strong> ${message || 'N/A'}</p>
      `
    });

    return res.status(201).json({ msg: "Your free counselling request has been submitted successfully." });

  } catch (err) {
    console.error("FreeCounselling create error:", err);
    return res.status(500).json({ msg: "Server error" });
  }
};
