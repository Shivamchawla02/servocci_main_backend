import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

const sendEmail = async (to, subject, html) => {
  try {
    const response = await resend.emails.send({
      from: "Servocci <shivam@servocci.com>", // Must be verified in Resend
      to,
      subject,
      html,
      text: html.replace(/<[^>]+>/g, ""), // Plain text fallback
    });

    // Log full response to check delivery status
    console.log("📩 Email sent response:", response);

    // Optional: check status if provided by Resend
    if (response?.status && response.status !== "queued") {
      console.warn("⚠️ Email may not be queued properly:", response);
    }

    return response;
  } catch (error) {
    console.error("❌ Email send failed:", error.response || error.message || error);
    throw error;
  }
};

export default sendEmail;
