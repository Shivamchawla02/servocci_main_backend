import express from "express";
import LoginLog from "../models/LoginLog.js";

const router = express.Router();

/* ===========================================
   📌 GET ALL LOGIN LOGS (Admin Panel)
=========================================== */
router.get("/", async (req, res) => {
  try {
    const logs = await LoginLog.find().sort({ loginTime: -1 });
    res.json({ success: true, logs });
  } catch (err) {
    console.error("Fetch Login Logs Error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

export default router;
