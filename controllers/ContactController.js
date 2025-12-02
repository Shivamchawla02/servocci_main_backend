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

  // EMAIL FOOTER (REUSABLE)
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

  try {
    // --------------------------------------------------
    // 📧 1. Email to Admin
    // --------------------------------------------------
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

        <hr />
        <p>Submitted via: Servocci Counsellors Website</p>

        ${emailFooter}
      `,
    });

    // --------------------------------------------------
    // 📧 2. Confirmation Email to User
    // --------------------------------------------------
    await resend.emails.send({
      from: "Servocci Counsellors <shivam@servocci.com>",
      to: email,
      subject: "We received your message",
      html: `
        <p>Hello ${name},</p>

        <p>This is to formally acknowledge that we have successfully received your message.</p>
        <p>Our team will contact you shortly with the next steps.</p>
        <p>If you need immediate assistance, feel free to reach us anytime.</p>

        <p>Thank you for reaching out to us.</p>

        <br>
        <p>
          Best Regards,<br/>
          <strong>Team Servocci Counsellors</strong><br/>
          +91-9958-21-9958 | +91-11-4161-8389
        </p>

        ${emailFooter}
      `,
    });

    return res.status(200).json({ msg: "Message sent successfully." });
  } catch (error) {
    console.error("Resend Email Error:", error);
    return res.status(500).json({ msg: "Failed to send message. Please try again later." });
  }
};
