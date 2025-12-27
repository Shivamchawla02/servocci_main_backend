// routes/subscribeRoutes.js
import express from "express";
import Subscription from "../models/Subscription.js";
import Student from "../models/Student.js";
import sendEmail from "../utils/sendEmail.js";

const router = express.Router();

/* =======================
   E-MAGAZINE LINKS
======================= */
const ISSUE_1 =
  "https://res.cloudinary.com/dhpm7jmyy/image/upload/v1763554640/Binder1_1__compressed_pv5cfc.pdf";

const ISSUE_2 =
  "https://res.cloudinary.com/dhpm7jmyy/image/upload/v1766816613/Magazine_2_vlko5l.pdf";

/* =======================
   HELPER VALIDATION
======================= */
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
    const requiredFields = [
      "full_name",
      "class_grade",
      "email_address",
      "phone_number",
    ];
    const missing = validateFields(requiredFields, req.body);

    if (missing.length > 0) {
      return res
        .status(400)
        .json({ message: `Missing required fields: ${missing.join(", ")}` });
    }

    const emailLower = req.body.email_address.trim().toLowerCase();

    const newSub = new Subscription({
      type: "student",
      name: req.body.full_name.trim(),
      grade: req.body.class_grade,
      email: emailLower,
      phone: req.body.phone_number.trim(),
      school: req.body.school_name_optional || "",
      exam: req.body.entrance_exam_if_any || "",
      remarks: req.body.remarks || "",
    });

    await newSub.save();

    // ✅ Update Student subscription flag
    const student = await Student.findOne({ email: emailLower });
    if (student) {
      student.subscribedToEMagazine = true;
      await student.save();
    }

    /* ===============================
       EMAIL TO STUDENT
    =============================== */
    await sendEmail(
      newSub.email,
      "Subscription Successful – Servocci Career Guidance",
      `
      <div style="font-family:Arial; line-height:1.6;">
        <h2>🎉 Thank you for subscribing, ${newSub.name}!</h2>

        <p>You are now subscribed to <strong>Servocci Career Updates</strong>.</p>

        <ul>
          <li>Career guidance resources</li>
          <li>Exam & admission updates</li>
          <li>Opportunities curated for your grade</li>
        </ul>

        <hr style="margin:20px 0;" />

        <h3>📘 Your Complimentary E-Magazines</h3>
        <p>You get access to both editions below:</p>

        <p>
          <a href="${ISSUE_1}"
             style="display:inline-block;margin-bottom:10px;padding:10px 16px;
             background:#ff4f00;color:#fff;text-decoration:none;border-radius:6px;">
             📥 Download Issue 01 – Career Foundations
          </a>
        </p>

        <p>
          <a href="${ISSUE_2}"
             style="display:inline-block;padding:10px 16px;
             background:#001b48;color:#fff;text-decoration:none;border-radius:6px;">
             📥 Download Issue 02 – Careers of the Future (NEW)
          </a>
        </p>

        <p style="font-size:14px;color:#555;margin-top:12px;">
          ✨ <strong>Issue 02</strong> focuses on emerging careers,
          future skills, and industry trends students should prepare for.
        </p>

        <br/>

        <p>
          Best Regards,<br/>
          <strong>Team Servocci Counsellors</strong><br/>
          +91-9958-21-9958 | +91-1141-61-8389
        </p>
      </div>
      `
    );

    /* ===============================
       EMAIL TO ADMIN
    =============================== */
    await sendEmail(
      "hello@servocci.com",
      "🆕 New Student Subscription Received",
      `
      <div style="font-family:Arial; line-height:1.6;">
        <h2>New Student Subscription</h2>
        <p><strong>Name:</strong> ${newSub.name}</p>
        <p><strong>Class/Grade:</strong> ${newSub.grade}</p>
        <p><strong>Email:</strong> ${newSub.email}</p>
        <p><strong>Phone:</strong> ${newSub.phone}</p>
        <p><strong>School:</strong> ${newSub.school}</p>
        <p><strong>Entrance Exam:</strong> ${newSub.exam}</p>
        <p><strong>Remarks:</strong> ${newSub.remarks}</p>
      </div>
      `
    );

    res.status(201).json({ message: "🎓 Student subscribed successfully!" });
  } catch (error) {
    console.error("Student subscription error:", error);
    res.status(500).json({ message: "Error saving student subscription" });
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
      return res
        .status(400)
        .json({ message: `Missing required fields: ${missing.join(", ")}` });
    }

    const emailLower = req.body.email_address.trim().toLowerCase();

    const newSub = new Subscription({
      type: "institution",
      name: req.body.institution_name.trim(),
      contactPerson: req.body.contact_person_name.trim(),
      email: emailLower,
      phone: req.body.phone_number.trim(),
      address: req.body.address || "",
      remarks: req.body.remarks || "",
    });

    await newSub.save();

    /* ===============================
       EMAIL TO INSTITUTION
    =============================== */
    await sendEmail(
      newSub.email,
      "Institution Subscription Confirmed – Servocci",
      `
      <div style="font-family:Arial; line-height:1.6;">
        <h2>🏫 Thank you for subscribing, ${newSub.name}</h2>
        <p>Dear ${newSub.contactPerson},</p>

        <ul>
          <li>Education & industry partnerships</li>
          <li>Training & placement collaboration</li>
          <li>Career guidance initiatives</li>
        </ul>

        <hr style="margin:20px 0;" />

        <h3>📘 Complimentary E-Magazine Access</h3>

        <p>
          <a href="${ISSUE_1}"
             style="display:inline-block;margin-bottom:10px;padding:10px 16px;
             background:#ff4f00;color:#fff;text-decoration:none;border-radius:6px;">
             📥 Issue 01 – Career Foundations
          </a>
        </p>

        <p>
          <a href="${ISSUE_2}"
             style="display:inline-block;padding:10px 16px;
             background:#001b48;color:#fff;text-decoration:none;border-radius:6px;">
             📥 Issue 02 – Future Skills & Careers (NEW)
          </a>
        </p>

        <p style="font-size:14px;color:#555;margin-top:12px;">
          ✨ <strong>Issue 02</strong> highlights global education trends,
          employability insights, and future workforce skills.
        </p>

        <br/>

        <p>
          Best Regards,<br/>
          <strong>Team Servocci Counsellors</strong><br/>
          +91-9958-21-9958 | +91-1141-61-8389
        </p>
      </div>
      `
    );

    /* ===============================
       EMAIL TO ADMIN
    =============================== */
    await sendEmail(
      "hello@servocci.com",
      "🏫 New Institution Subscription Received",
      `
      <div style="font-family:Arial; line-height:1.6;">
        <h2>New Institution Subscription</h2>
        <p><strong>Institution:</strong> ${newSub.name}</p>
        <p><strong>Contact Person:</strong> ${newSub.contactPerson}</p>
        <p><strong>Email:</strong> ${newSub.email}</p>
        <p><strong>Phone:</strong> ${newSub.phone}</p>
        <p><strong>Address:</strong> ${newSub.address}</p>
        <p><strong>Remarks:</strong> ${newSub.remarks}</p>
      </div>
      `
    );

    res.status(201).json({ message: "🏫 Institution subscribed successfully!" });
  } catch (error) {
    console.error("Institution subscription error:", error);
    res.status(500).json({ message: "Error saving institution subscription" });
  }
});

// -----------------------------------------------------------------------
//                         ADMIN GET + DELETE
// -----------------------------------------------------------------------
router.get("/", async (req, res) => {
  try {
    const { type } = req.query;
    const filter = type ? { type } : {};
    const subs = await Subscription.find(filter).sort({ createdAt: -1 });
    res.status(200).json({ count: subs.length, data: subs });
  } catch {
    res.status(500).json({ message: "Error fetching subscriptions" });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const deleted = await Subscription.findByIdAndDelete(req.params.id);
    if (!deleted)
      return res.status(404).json({ message: "Subscription not found" });
    res.status(200).json({ message: "Subscription deleted successfully" });
  } catch {
    res.status(500).json({ message: "Error deleting subscription" });
  }
});

export default router;
