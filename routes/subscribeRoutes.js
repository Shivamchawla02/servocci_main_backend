import express from "express";
import Subscription from "../models/Subscription.js";

const router = express.Router();

// 🧑‍🎓 Student Subscription
router.post("/student", async (req, res) => {
  try {
    const newSub = new Subscription({ ...req.body, type: "student" });
    await newSub.save();
    res.status(201).json({ message: "Student subscribed successfully!" });
  } catch (error) {
    console.error("Error saving student subscription:", error);
    res.status(500).json({ message: "Error saving student subscription", error });
  }
});

// 🏫 Institution Subscription
router.post("/institution", async (req, res) => {
  try {
    const newSub = new Subscription({ ...req.body, type: "institution" });
    await newSub.save();
    res.status(201).json({ message: "Institution subscribed successfully!" });
  } catch (error) {
    console.error("Error saving institution subscription:", error);
    res.status(500).json({ message: "Error saving institution subscription", error });
  }
});

export default router;
