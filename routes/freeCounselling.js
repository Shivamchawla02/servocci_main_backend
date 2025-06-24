import express from "express";
import { createBooking } from "../controllers/FreeCounsellingController.js";

const router = express.Router();

// POST /api/free-counselling
router.post("/", createBooking);

export default router;
