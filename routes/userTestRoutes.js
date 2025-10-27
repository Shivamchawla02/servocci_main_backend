import express from "express";
import {
  addUserTest,
  getAllUserTests,
  updateUserTestReport,
} from "../controllers/userTestController.js";

const router = express.Router();

// ➕ Save user test details
router.post("/add", addUserTest);

// 📋 Fetch all user test submissions
router.get("/", getAllUserTests);

// 📝 Update report URL (after Cloudinary upload)
router.put("/:id", updateUserTestReport);

export default router;
