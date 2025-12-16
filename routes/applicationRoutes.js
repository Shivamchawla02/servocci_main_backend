import express from "express";
import { createApplication } from "../controllers/applicationController.js";

const router = express.Router();

router.post("/apply", createApplication);

export default router;
