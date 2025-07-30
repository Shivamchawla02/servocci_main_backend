import FreeCounsellingRequest from "../models/FreeCounsellingRequest.js";
import nodemailer from "nodemailer";

export const createBooking = async (req, res) => {
  try {
    const { name, phone, email, preferredDate, preferredTime, message } = req.body;

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
      message
    });
    await newBooking.save();

    // Nodemailer setup
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,  // hello@servocci.com
        pass: process.env.EMAIL_PASS   // app password
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
          Preferred Time: ${preferredTime}<br/>
          Message: ${message || 'N/A'}</p>
          <p>Best regards,<br/>Servocci Counsellors</p>
        `
      });
    }

    // 📩 Email to admin (hello@servocci.com)
    await transporter.sendMail({
      from: `"Servocci Counsellors" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_USER,
      subject: "New Free Counselling Booking",
      html: `
        <p>A new free counselling request has been submitted:</p>
        <p><strong>Name:</strong> ${name}<br/>
        <strong>Phone:</strong> ${phone}<br/>
        <strong>Email:</strong> ${email || 'N/A'}<br/>
        <strong>Preferred Date:</strong> ${preferredDate}<br/>
        <strong>Preferred Time:</strong> ${preferredTime}<br/>
        <strong>Message:</strong> ${message || 'N/A'}</p>
      `
    });

    return res.status(201).json({ msg: "Your free counselling request has been submitted successfully." });

  } catch (err) {
    console.error("FreeCounselling create error:", err);
    return res.status(500).json({ msg: "Server error" });
  }
};



// ✅ NEW FUNCTION: Get all counselling requests (for admin dashboard)
export const getAllBookings = async (req, res) => {
  try {
    const requests = await FreeCounsellingRequest.find().sort({ createdAt: -1 });
    res.status(200).json(requests);
  } catch (err) {
    console.error("Error fetching counselling requests:", err);
    res.status(500).json({ msg: "Server error" });
  }
};
