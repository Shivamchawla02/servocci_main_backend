import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

const sendEmail = async (to, subject, html) => {
  try {
    const response = await resend.emails.send({
      from: "Servocci Counsellors <hello@servocci.com>",
      to,
      subject,
      html,
      text: html.replace(/<[^>]+>/g, ""),
    });

    console.log("📩 Email sent response:", response);
    return response;
  } catch (error) {
    console.error("❌ Email send failed:", error);
    throw error;
  }
};

export default sendEmail;
