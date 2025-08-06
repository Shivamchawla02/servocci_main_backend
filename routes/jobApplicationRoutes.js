import express from "express";
import {
  saveJobApplication,
  getJobApplications, // 👈 add this
} from "../controllers/jobApplicationController.js";

const router = express.Router();

router.post("/", saveJobApplication);
router.get("/", getJobApplications); // ✅ Add this route

export default router;
