import express from "express";
import Subscription from "../models/Subscription.js";

const router = express.Router();

// ✅ Helper validation function
const validateFields = (fields, body) => {
  const missing = fields.filter((field) => !body[field] || body[field].trim() === "");
  return missing;
};

// 🧑‍🎓 Student Subscription
router.post("/student", async (req, res) => {
  try {
    const requiredFields = ["full_name", "class_/_grade", "email_address", "phone_number"];
    const missing = validateFields(requiredFields, req.body);

    if (missing.length > 0) {
      return res.status(400).json({ message: `Missing required fields: ${missing.join(", ")}` });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^[0-9]{10}$/;

    if (!emailRegex.test(req.body.email_address))
      return res.status(400).json({ message: "Invalid email format" });
    if (!phoneRegex.test(req.body.phone_number))
      return res.status(400).json({ message: "Phone number must be 10 digits" });

    const newSub = new Subscription({
      type: "student",
      name: req.body.full_name,
      grade: req.body["class_/_grade"],
      email: req.body.email_address,
      phone: req.body.phone_number,
      school: req.body["school_name_(optional)"],
      exam: req.body["entrance_exam_(if_any)"],
      remarks: req.body.remarks,
    });

    await newSub.save();
    res.status(201).json({ message: "🎓 Student subscribed successfully!" });
  } catch (error) {
    console.error("Error saving student subscription:", error);
    res.status(500).json({ message: "Error saving student subscription", error });
  }
});

// 🏫 Institution Subscription
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

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^[0-9]{10}$/;

    if (!emailRegex.test(req.body.email_address))
      return res.status(400).json({ message: "Invalid email format" });
    if (!phoneRegex.test(req.body.phone_number))
      return res.status(400).json({ message: "Phone number must be 10 digits" });

    const newSub = new Subscription({
      type: "institution",
      name: req.body.institution_name,
      contactPerson: req.body.contact_person_name,
      email: req.body.email_address,
      phone: req.body.phone_number,
      address: req.body.address,
      remarks: req.body.remarks,
    });

    await newSub.save();
    res.status(201).json({ message: "🏫 Institution subscribed successfully!" });
  } catch (error) {
    console.error("Error saving institution subscription:", error);
    res.status(500).json({ message: "Error saving institution subscription", error });
  }
});


// 🧩 Admin Routes
// ✅ Get all subscriptions
router.get("/", async (req, res) => {
  try {
    const { type } = req.query; // Optional ?type=student
    const filter = type ? { type } : {};
    const subs = await Subscription.find(filter).sort({ createdAt: -1 });
    res.status(200).json({ count: subs.length, data: subs });
  } catch (error) {
    console.error("Error fetching subscriptions:", error);
    res.status(500).json({ message: "Error fetching subscriptions" });
  }
});

// ✅ Delete subscription by ID
router.delete("/:id", async (req, res) => {
  try {
    const deleted = await Subscription.findByIdAndDelete(req.params.id);
    if (!deleted)
      return res.status(404).json({ message: "Subscription not found" });
    res.status(200).json({ message: "Subscription deleted successfully" });
  } catch (error) {
    console.error("Error deleting subscription:", error);
    res.status(500).json({ message: "Error deleting subscription" });
  }
});

export default router;
