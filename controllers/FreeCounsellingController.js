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

    // ---------------------------------------
    // 📩 EMAIL TO USER (only if they provided email)
if (email) {
  await resend.emails.send({
    from: "Servocci Counsellors <shivam@servocci.com>",
    to: email,
    subject: "Thank you for booking your free counselling session",
    html: `
      <p>Hi ${name},</p>

      <p>Thank you for booking a free career counselling session with Servocci Counsellors.</p>
      <p>Our team will contact you shortly to confirm your session and guide you further.</p>

      <p><strong>Your Booking Details:</strong><br/>
      <strong>Phone:</strong> ${phone}<br/>
      <strong>Preferred Date:</strong> ${preferredDate}<br/>
      <strong>Preferred Time:</strong> ${preferredTime}<br/>
      <strong>Course:</strong> ${course || "N/A"}<br/>
      <strong>Message:</strong> ${message || "N/A"}
      </p>

      <hr>

      <p>This is to formally acknowledge that we have successfully received your counselling session request.</p>
      <p>We are available to discuss any further information, clarification, or next steps as required.</p>
      <p>Please feel free to contact us at your convenience.</p>

      <p>Thank you for connecting with us.</p>

        <br>
        <p>Best Regards<br/>
        Team Servocci Counsellors<br/>
        +91-9958-21-9958 | +91-1141-61-8389<br/>
        </p>
    `,
  });
}


    // ---------------------------------------
    // 📩 EMAIL TO ADMIN (hello@servocci.com)
    // ---------------------------------------
    // 📩 EMAIL TO ADMIN (hello@servocci.com)
    await resend.emails.send({
      from: "Servocci <shivam@servocci.com>",
      to: "hello@servocci.com",
      subject: "New Free Counselling Booking",
      html: `
        <p><strong>New Free Counselling Request Received:</strong></p>

        <p>
          <strong>Name:</strong> ${name}<br/>
          <strong>Phone:</strong> ${phone}<br/>
          <strong>Email:</strong> ${email || "N/A"}<br/>
          <strong>Preferred Date:</strong> ${preferredDate}<br/>
          <strong>Preferred Time:</strong> ${preferredTime}<br/>
          <strong>Course:</strong> ${course || "N/A"}<br/>
          <strong>Message:</strong> ${message || "N/A"}
        </p>

        <hr>

        <p>Submitted via: Servocci Counsellors Website</p>

      `,
    });


    return res.status(201).json({
      msg: "Your free counselling request has been submitted successfully.",
    });

  } catch (err) {
    console.error("FreeCounselling create error:", err);
    return res.status(500).json({ msg: "Server error while sending request" });
  }
};



// ---------------------------------------
// ✅ GET ALL BOOKINGS (Admin Panel)
// ---------------------------------------
export const getAllBookings = async (req, res) => {
  try {
    const requests = await FreeCounsellingRequest
      .find()
      .sort({ createdAt: -1 });

    res.status(200).json(requests);

  } catch (err) {
    console.error("Error fetching counselling requests:", err);
    res.status(500).json({ msg: "Server error" });
  }
};
