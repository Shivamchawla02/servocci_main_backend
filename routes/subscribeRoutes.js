// routes/subscribeRoutes.js
import express from "express";
import Subscription from "../models/Subscription.js";
import sendEmail from "../utils/sendEmail.js";

const router = express.Router();

// Helper validation
const validateFields = (fields, body) => {
  const missing = fields.filter(
    (field) => !body[field] || String(body[field]).trim() === ""
  );
  return missing;
};


// -----------------------------------------------------------------------
//                           STUDENT SUBSCRIPTION
// -----------------------------------------------------------------------
router.post("/student", async (req, res) => {
  try {
    const requiredFields = ["full_name", "class_grade", "email_address", "phone_number"];
    const missing = validateFields(requiredFields, req.body);

    if (missing.length > 0) {
      return res.status(400).json({ message: `Missing required fields: ${missing.join(", ")}` });
    }

    const newSub = new Subscription({
      type: "student",
      name: req.body.full_name.trim(),
      grade: req.body.class_grade,
      email: req.body.email_address.trim().toLowerCase(),
      phone: req.body.phone_number.trim(),
      school: req.body.school_name_optional || "",
      exam: req.body.entrance_exam_if_any || "",
      remarks: req.body.remarks || ""
    });

    await newSub.save();

    // ================================
    // 1️⃣ Email to STUDENT (Confirmation)
    // ================================
    await sendEmail(
      newSub.email,
      "Subscription Successful – Servocci Career Guidance",
      `
      <div style="font-family: Arial; line-height: 1.6;">
        <h2>🎉 Thank you for subscribing, ${newSub.name}!</h2>
        <p>You are now subscribed to Servocci career updates.</p>
        <p>We will send you:</p>
        <ul>
          <li>Career guidance resources</li>
          <li>Exam & admission updates</li>
          <li>Important opportunities based on your grade</li>
        </ul>
        <br/>
        <p>Regards,<br/>Team Servocci</p>
      </div>
      `
    );

    // ================================
    // 2️⃣ Email to ADMIN (hello@servocci.com)
    // ================================
    await sendEmail(
      "hello@servocci.com",
      "🆕 New Student Subscription Received",
      `
      <div style="font-family: Arial; line-height: 1.6;">
        <h2>New Student Subscription</h2>
        <p><strong>Name:</strong> ${newSub.name}</p>
        <p><strong>Class/Grade:</strong> ${newSub.grade}</p>
        <p><strong>Email:</strong> ${newSub.email}</p>
        <p><strong>Phone:</strong> ${newSub.phone}</p>
        <p><strong>School:</strong> ${newSub.school}</p>
        <p><strong>Entrance Exam:</strong> ${newSub.exam}</p>
        <p><strong>Remarks:</strong> ${newSub.remarks}</p>
        <br/>
        <p>This subscription has been added to the database.</p>
      </div>
      `
    );

    res.status(201).json({ message: "🎓 Student subscribed successfully!" });
  } catch (error) {
    console.error("Error saving student subscription:", error);
    res.status(500).json({ message: "Error saving student subscription", error });
  }
});


// -----------------------------------------------------------------------
//                         INSTITUTION SUBSCRIPTION
// -----------------------------------------------------------------------
router.post("/institution", async (req, res) => {
  try {
    const requiredFields = [
      "institution_type",
      "institution_name",
      "contact_person_name",
      "phone_number",
      "email_address",
    ];
    const missing = validateFields(requiredFields, req.body);

    if (missing.length > 0) {
      return res.status(400).json({ message: `Missing required fields: ${missing.join(", ")}` });
    }

    const newSub = new Subscription({
      type: "institution",
      name: req.body.institution_name.trim(),
      contactPerson: req.body.contact_person_name.trim(),
      email: req.body.email_address.trim().toLowerCase(),
      phone: req.body.phone_number.trim(),
      address: req.body.address || "",
      remarks: req.body.remarks || ""
    });

    await newSub.save();

    // ================================
    // 1️⃣ Email to INSTITUTION (Confirmation)
    // ================================
    await sendEmail(
      newSub.email,
      "Institution Subscription Confirmed – Servocci",
      `
      <div style="font-family: Arial; line-height: 1.6;">
        <h2>🏫 Thank you for subscribing, ${newSub.name}</h2>
        <p>Dear ${newSub.contactPerson},</p>
        <p>Your institution has been registered for updates from Servocci.</p>
        <p>We will send:</p>
        <ul>
          <li>Education partnership options</li>
          <li>Training & placement support</li>
          <li>Student development programs</li>
        </ul>
        <br/>
        <p>Regards,<br/>Team Servocci</p>
      </div>
      `
    );

    // ================================
    // 2️⃣ Email to ADMIN (hello@servocci.com)
    // ================================
    await sendEmail(
      "hello@servocci.com",
      "🏫 New Institution Subscription Received",
      `
      <div style="font-family: Arial; line-height: 1.6;">
        <h2>New Institution Subscription</h2>
        <p><strong>Institution:</strong> ${newSub.name}</p>
        <p><strong>Contact Person:</strong> ${newSub.contactPerson}</p>
        <p><strong>Email:</strong> ${newSub.email}</p>
        <p><strong>Phone:</strong> ${newSub.phone}</p>
        <p><strong>Address:</strong> ${newSub.address}</p>
        <p><strong>Remarks:</strong> ${newSub.remarks}</p>
        <br/>
        <p>This subscription has been added to the database.</p>
      </div>
      `
    );

    res.status(201).json({ message: "🏫 Institution subscribed successfully!" });
  } catch (error) {
    console.error("Error saving institution subscription:", error);
    res.status(500).json({ message: "Error saving institution subscription", error });
  }
});


// ADMIN GET + DELETE (same as before)
router.get("/", async (req, res) => {
  try {
    const { type } = req.query;
    const filter = type ? { type } : {};
    const subs = await Subscription.find(filter).sort({ createdAt: -1 });
    res.status(200).json({ count: subs.length, data: subs });
  } catch (error) {
    res.status(500).json({ message: "Error fetching subscriptions" });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const deleted = await Subscription.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Subscription not found" });
    res.status(200).json({ message: "Subscription deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting subscription" });
  }
});

export default router;
