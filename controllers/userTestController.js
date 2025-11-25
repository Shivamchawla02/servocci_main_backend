import UserTest from "../models/UserTest.js";
import { Resend } from "resend";
import dotenv from "dotenv";

dotenv.config();

const resend = new Resend(process.env.RESEND_API_KEY);

// ➕ Save user test details
export const addUserTest = async (req, res) => {
  try {
    const { name, phone, email, plan } = req.body;

    if (!name || !phone || !email) {
      return res
        .status(400)
        .json({ success: false, message: "All fields are required" });
    }

    const newUser = new UserTest({
      name,
      phone,
      email,
      plan: plan || "Basic",
    });

    await newUser.save();

    /* -------------------------------------------
       📧 SEND EMAIL NOTIFICATIONS USING RESEND
    --------------------------------------------- */

    try {
      // 1️⃣ Email to Admin
      await resend.emails.send({
        from: `Servocci Website <shivam@servocci.com>`,
        to: "hello@servocci.com",
        subject: "New Psychometric Test Submission",
        html: `
          <h2>New Psychometric Test Request</h2>
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Phone:</strong> ${phone}</p>
          <p><strong>Selected Plan:</strong> ${plan || "Basic"}</p>
          <p>Login to admin panel to view full details.</p>
        `,
      });

      // 2️⃣ Confirmation Email to User
      // 2️⃣ Confirmation Email to User
      await resend.emails.send({
        from: "Servocci <shivam@servocci.com>",
        to: email,
        subject: "We received your test request",
        html: `
          <p>Hello ${name},</p>
          <p>Thank you for requesting a psychometric test with Servocci Counsellors.</p>
          <p>We will send your report to your email once it is ready. It will also be uploaded to your account and can be viewed after logging into our website.</p>
          <br>
        <p>Best Regards<br/>
        Team Servocci Counsellors<br/>
        +91-9958-21-9958 | +91-1141-61-8389<br/>
        </p>
        `,
        });


    } catch (emailErr) {
      console.error("❌ Resend Email Error (UserTest):", emailErr);
      // Do NOT stop the API — email failure should not break form submission
    }

    /* ------------------------------------------- */

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

// 📋 Get all user test submissions
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

    /* -------------------------------------------
       📧 OPTIONAL: SEND EMAIL TO USER WHEN REPORT IS READY
    --------------------------------------------- */
try {
  await resend.emails.send({
    from: "Servocci <shivam@servocci.com>",
    to: updatedUser.email,
    subject: "Your Psychometric Report is Ready",
    html: `
      <p>Hello ${updatedUser.name},</p>

      <p>Your psychometric test report is now available.</p>
      <p>You can access it here:</p>
      <p><a href="${reportUrl}" target="_blank">${reportUrl}</a></p>

      <hr>

      <p>This is to formally acknowledge that we have successfully received your psychometric test report.</p>
      <p>We are now available to discuss any further information, clarification, or next steps as required.</p>
      <p>Please feel free to contact us at your convenience.</p>

      <p>Thank you for your cooperation.</p>

        <br>
        <p>Best Regards<br/>
        Team Servocci Counsellors<br/>
        +91-9958-21-9958 | +91-1141-61-8389<br/>
        </p>
    `,
  });
} catch (emailErr) {
  console.error("❌ Resend Email Error (Report Update):", emailErr);
}


    /* ------------------------------------------- */

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
