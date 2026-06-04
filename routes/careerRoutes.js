import express from "express";

import {
  submitCareerApplication,
  getCareerApplications,
} from "../controllers/careerController.js";

const router = express.Router();

router.post(
  "/",
  submitCareerApplication
);

router.get(
  "/",
  getCareerApplications
);

export default router;