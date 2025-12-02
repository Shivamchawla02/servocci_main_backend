import UserTest from "../models/UserTest.js";
import Student from "../models/Student.js";
import { Resend } from "resend";
import dotenv from "dotenv";

dotenv.config();
const resend = new Resend(process.env.RESEND_API_KEY);

// 🌟 Reusable Email Template (Header + Footer)
const emailWrapper = (content) => `
  <div style="font-family: Arial, sans-serif; padding: 20px; background: #f7f7f7;">
  
    <!-- Logo Header -->
    <div style="text-align: center; padding: 20px;">
      <img src="https://res.cloudinary.com/dhpm7jmyy/image/upload/v1764674835/logoblackk_b8bazl.png" 
           alt="Servocci Logo" 
           style="width: 180px; height: auto;" />
    </div>

    <!-- Email Body -->
    <div style="background: #ffffff; padding: 25px; border-radius: 10px; box-shadow: 0 0 10px rgba(0,0,0,0.08);">
      ${content}
    </div>

    <!-- Footer -->
    <div style="text-align: center; margin-top: 25px; padding: 20px; font-size: 13px; color: #555;">
      <p style="margin: 0;">Best Regards,<br><strong>Team Servocci Counsellors</strong></p>
      <p style="margin: 5px 0;">
        +91-9958-21-9958 | +91-1141-61-8389<br>
        <a href="https://servocci.com" target="_blank" style="color:#ff4f00; text-decoration:none;">www.servocci.com</a>
      </p>
      <hr style="margin: 15px auto; width: 60%; border: none; border-top: 1px solid #ddd;" />
      <p style="font-size: 12px; color: #777;">© ${new Date().getFullYear()} Servocci Counsellors. All Rights Reserved.</p>
    </div>

  </div>
`;


// ➕ Save user test details
export const addUserTest = async (req, res) => {
  try {
    const { name, phone, email, plan } = req.body;

    if (!name || !phone || !email) {
      return res
        .status(400)
        .json({ success: false, message: "All fields are required" });
    }

    // Save user test submission
    const newUser = new UserTest({
      name,
      phone,
      email,
      plan: plan || "Basic",
    });

    await newUser.save();

    // Update Student record (psychometricTestGiven = true)
    const student = await Student.findOne({ email: email.toLowerCase() });
    if (student) {
      student.psychometricTestGiven = true;
      await student.save();
    }


    /* -------------------------------------------
        📧 SEND EMAIL NOTIFICATIONS USING RESEND
    --------------------------------------------- */

    try {
      // Email to Admin
      await resend.emails.send({
        from: `Servocci Website <shivam@servocci.com>`,
        to: "hello@servocci.com",
        subject: "New Psychometric Test Submission",
        html: emailWrapper(`
          <h2 style="color:#001b48;">New Psychometric Test Request</h2>

          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Phone:</strong> ${phone}</p>
          <p><strong>Selected Plan:</strong> ${plan || "Basic"}</p>

          <p>Login to admin panel to view all details.</p>
        `),
      });

      // Confirmation email to User
      await resend.emails.send({
        from: "Servocci Counsellors <shivam@servocci.com>",
        to: email,
        subject: "We received your psychometric test request",
        html: emailWrapper(`
          <p>Hello <strong>${name}</strong>,</p>

          <p>Thank you for requesting a psychometric test with <strong>Servocci Counsellors</strong>.</p>

          <p>Your test details have been received. We will email your report once it is ready.  
          It will also appear inside your online dashboard.</p>

          <p>We appreciate your trust in us.</p>
        `),
      });

    } catch (emailErr) {
      console.error("❌ Resend Email Error (UserTest):", emailErr);
    }


    res.status(201).json({
      success: true,
      message: "Details saved successfully!",
      data: newUser,
    });

  } catch (error) {
    console.error("❌ Error saving user test:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};


// 📋 Get all user tests
export const getAllUserTests = async (req, res) => {
  try {
    const users = await UserTest.find().sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      data: users,
    });
  } catch (error) {
    console.error("❌ Error fetching user tests:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};


// 📝 Update psychometric test report URL
export const updateUserTestReport = async (req, res) => {
  try {
    const { id } = req.params;
    const { reportUrl } = req.body;

    if (!reportUrl) {
      return res.status(400).json({
        success: false,
        message: "Report URL is required",
      });
    }

    const updatedUser = await UserTest.findByIdAndUpdate(
      id,
      { reportUrl },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Email user when report is ready
    try {
      await resend.emails.send({
        from: "Servocci Counsellors <shivam@servocci.com>",
        to: updatedUser.email,
        subject: "Your Psychometric Report is Ready",
        html: emailWrapper(`
          <p>Hello <strong>${updatedUser.name}</strong>,</p>

          <p>Your psychometric test report is now ready.</p>

          <p><a href="${reportUrl}" target="_blank" style="color:#ff4f00;">Click here to view your report</a></p>

          <p>If you have any questions, feel free to contact us.</p>
        `),
      });

    } catch (emailErr) {
      console.error("❌ Resend Email Error (Report Update):", emailErr);
    }

    res.status(200).json({
      success: true,
      message: "Report URL updated successfully",
      data: updatedUser,
    });

  } catch (error) {
    console.error("❌ Error updating report URL:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};
