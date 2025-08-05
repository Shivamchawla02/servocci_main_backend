import express from "express";
import { saveJobApplication } from "../controllers/jobApplicationController.js";

const router = express.Router();

// POST /api/job-applications
router.post("/", saveJobApplication);

export default router;
