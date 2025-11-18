import nodemailer from "nodemailer";

const sendEmail = async (to, subject, html) => {
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,      // e.g., smtp.gmail.com
      port: process.env.SMTP_PORT,      // 465 for SSL, 587 for TLS
      secure: process.env.SMTP_PORT == 465, 
      auth: {
        user: process.env.SMTP_USER,    // your Gmail / SMTP email
        pass: process.env.SMTP_PASS,    // App password
      },
    });

    const info = await transporter.sendMail({
      from: `"Servocci" <${process.env.SMTP_USER}>`,
      to,
      subject,
      html,
    });

    console.log("📧 Email sent:", info.messageId);
  } catch (err) {
    console.error("❌ Email sending failed:", err);
  }
};

export default sendEmail;
