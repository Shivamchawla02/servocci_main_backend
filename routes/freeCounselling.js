import express from "express";
import { createBooking, getAllBookings } from "../controllers/FreeCounsellingController.js";

const router = express.Router();

// ✅ User submits booking
router.post("/", createBooking);

// ✅ Admin fetches all bookings
router.get("/", getAllBookings);

export default router;
