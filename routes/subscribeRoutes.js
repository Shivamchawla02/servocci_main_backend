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

// POST /api/subscription/student
router.post("/student", async (req, res) => {
  try {
    const requiredFields = ["full_name", "class_grade", "email_address", "phone_number"];
    const missing = validateFields(requiredFields, req.body);

    if (missing.length > 0) {
      return res.status(400).json({ message: `Missing required fields: ${missing.join(", ")}` });
    }

    // normalize
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

    // Optional: send confirmation email to student (uncomment if you want)
    // await sendEmail(newSub.email, "Subscription Confirmed", `<p>Thanks ${newSub.name}...</p>`);

    res.status(201).json({ message: "🎓 Student subscribed successfully!" });
  } catch (error) {
    console.error("Error saving student subscription:", error);
    res.status(500).json({ message: "Error saving student subscription", error });
  }
});

// POST /api/subscription/institution
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

    // Optional admin notification
    // await sendEmail("hello@servocci.com", "New Institution Subscription", `<p>New sub: ${newSub.name}</p>`);

    res.status(201).json({ message: "🏫 Institution subscribed successfully!" });
  } catch (error) {
    console.error("Error saving institution subscription:", error);
    res.status(500).json({ message: "Error saving institution subscription", error });
  }
});

// ADMIN: GET all subscriptions (optionally filter ?type=student)
router.get("/", async (req, res) => {
  try {
    const { type } = req.query;
    const filter = type ? { type } : {};
    const subs = await Subscription.find(filter).sort({ createdAt: -1 });
    res.status(200).json({ count: subs.length, data: subs });
  } catch (error) {
    console.error("Error fetching subscriptions:", error);
    res.status(500).json({ message: "Error fetching subscriptions" });
  }
});

// ADMIN: delete
router.delete("/:id", async (req, res) => {
  try {
    const deleted = await Subscription.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Subscription not found" });
    res.status(200).json({ message: "Subscription deleted successfully" });
  } catch (error) {
    console.error("Error deleting subscription:", error);
    res.status(500).json({ message: "Error deleting subscription" });
  }
});

export default router;
