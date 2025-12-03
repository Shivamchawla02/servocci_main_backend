// controllers/magazineEmailController.js

import { Resend } from "resend";
import dotenv from "dotenv";

dotenv.config();
const resend = new Resend(process.env.RESEND_API_KEY);

export const sendMagazineReminder = async (req, res) => {
  try {
    const { name, email } = req.body;

    if (!name || !email) {
      return res.status(400).json({ msg: "Name and email are required" });
    }

    // 👉 Your Cloudinary PDF link of the E-Magazine
    const magazineLink = "https://res.cloudinary.com/dhpm7jmyy/image/upload/v1763554640/Binder1_1__compressed_pv5cfc.pdf";

    // 👉 Subscription page
    const profileLink = "https://servocci.com/e-magazine";

    const html = `
      <p>Hi <strong>${name}</strong>,</p>

      <p>You haven't subscribed to our <strong>Servocci E-Magazine</strong> yet!</p>

      <p>
        Stay updated with career guidance, education insights, and expert advice every month.
      </p>

      <p>
        👉 Click here to subscribe:<br/>
        <a href="${profileLink}" style="color:#ff4f00;font-weight:bold;">
          Subscribe to E-Magazine
        </a>
      </p>

      <p>
        You can also check the latest issue:<br/>
        <a href="${magazineLink}" target="_blank">View E-Magazine</a>
      </p>

      <p>
        Warm regards,<br/>
        <strong>Team Servocci Counsellors</strong>
      </p>
    `;

    // ⚠️ IMPORTANT: use the verified sender format (same as contactController)
    await resend.emails.send({
      from: `Servocci Counsellors <shivam@servocci.com>`,
      to: email,
      subject: "Reminder: Subscribe to Servocci E-Magazine",
      html,
    });

    return res.status(200).json({ msg: "Reminder email sent successfully!" });
  } catch (err) {
    console.error("Resend Magazine Email Error:", err);
    return res.status(500).json({ msg: "Failed to send email. Please try again later." });
  }
};
