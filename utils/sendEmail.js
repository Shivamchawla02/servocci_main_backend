import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

const sendEmail = async (to, subject, html) => {
  try {
    const response = await resend.emails.send({
      from: "Servocci <shivam@servocci.com>",
      to,
      subject,
      html,
    });

    console.log("📩 Email sent to:", to);
    return response;
  } catch (error) {
    console.error("❌ Email send failed:", error);
    throw error;
  }
};

export default sendEmail;
