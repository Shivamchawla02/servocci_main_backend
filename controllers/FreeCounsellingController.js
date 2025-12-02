import FreeCounsellingRequest from "../models/FreeCounsellingRequest.js";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

// ---------------------------------------
// 📌 Reusable EMAIL FOOTER with Logo + Social Media + Contact
// ---------------------------------------
const emailFooter = `
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0f172a; padding:30px 20px; color:#cccccc; font-family:Arial, sans-serif; margin-top:30px;">
    <tr>
      <td align="center">

        <!-- Logo -->
        <img src="https://res.cloudinary.com/dhpm7jmyy/image/upload/v1764674835/logoblackk_b8bazl.png"
             alt="Servocci Counsellors"
             width="140"
             style="display:block; margin-bottom:20px;" />

        <!-- Social Icons -->
        <table cellpadding="0" cellspacing="0" style="margin-bottom:25px;">
          <tr>
            <td style="padding:0 8px;">
              <a href="https://www.facebook.com/profile.php?id=61555148367108" target="_blank">
                <img src="https://cdn-icons-png.flaticon.com/512/733/733547.png" width="28" />
              </a>
            </td>
            <td style="padding:0 8px;">
              <a href="https://www.instagram.com/servocci/" target="_blank">
                <img src="https://cdn-icons-png.flaticon.com/512/2111/2111463.png" width="28" />
              </a>
            </td>
            <td style="padding:0 8px;">
              <a href="https://x.com/servocci?t=ciFRSRDIJJ0FwaX4OvgFhQ&s=09" target="_blank">
                <img src="https://cdn-icons-png.flaticon.com/512/5968/5968958.png" width="28" />
              </a>
            </td>
            <td style="padding:0 8px;">
              <a href="https://www.youtube.com/@SERVOCCI" target="_blank">
                <img src="https://cdn-icons-png.flaticon.com/512/1384/1384060.png" width="28" />
              </a>
            </td>
            <td style="padding:0 8px;">
              <a href="https://in.linkedin.com/company/servocci" target="_blank">
                <img src="https://cdn-icons-png.flaticon.com/512/174/174857.png" width="28" />
              </a>
            </td>
          </tr>
        </table>

        <!-- Contact Info -->
        <p style="margin:0; font-size:14px; line-height:22px;">
          <strong style="color:white;">Servocci Counsellors</strong><br />
          📞 +91-11-4161-8389 (Counselling Office)<br />
          📞 +91-9958-21-9958 (Admissions)<br />
          📧 <a href="mailto:hello@servocci.com" style="color:#ff9d3d; text-decoration:none;">hello@servocci.com</a>
        </p>

        <p style="margin-top:20px; font-size:12px; color:#777;">
          © 2025 Servocci Counsellors. All rights reserved.
        </p>

      </td>
    </tr>
  </table>
`;

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

    // ----------------------------------------------------
    // 📩 EMAIL TO USER (ONLY IF EMAIL PROVIDED)
    // ----------------------------------------------------
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

          <p>This is to acknowledge that we have successfully received your counselling request.</p>
          <p>For any clarification or next steps, feel free to contact us.</p>

          <p>Thank you for connecting with us.</p>

          <br>
          <p>
            Best Regards<br/>
            <strong>Team Servocci Counsellors</strong><br/>
            +91-9958-21-9958 | +91-11-4161-8389<br/>
          </p>

          ${emailFooter}
        `,
      });
    }

    // ----------------------------------------------------
    // 📩 EMAIL TO ADMIN (hello@servocci.com)
    // ----------------------------------------------------
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

        ${emailFooter}
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


// ----------------------------------------------------
// ✅ GET ALL BOOKINGS (Admin Panel)
// ----------------------------------------------------
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
