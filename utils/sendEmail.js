import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: true, // Google Workspace requires secure SSL
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

const sendEmail = async (to, subject, html) => {
  try {
    await transporter.sendMail({
      from: `"Servocci" <${process.env.SMTP_USER}>`,
      to,
      subject,
      html,
    });
    console.log("📩 Email sent to:", to);
  } catch (error) {
    console.error("❌ Email send failed:", error);
  }
};

export default sendEmail;
