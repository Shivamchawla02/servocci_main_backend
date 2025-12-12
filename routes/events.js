import express from "express";
import Event from "../models/Event.js";

const router = express.Router();

// Create Event
router.post("/", async (req, res) => {
  try {
    const { title, date, description, coverImage, extraImages } = req.body;

    if (!title || !date || !description || !coverImage) {
      return res
        .status(400)
        .json({ msg: "Required fields: title, date, description, coverImage" });
    }

    const event = new Event({
      title,
      date,
      description,
      coverImage,
      extraImages: extraImages || [],
    });

    await event.save();

    res.status(201).json({
      success: true,
      msg: "Event created successfully",
      event,
    });

  } catch (err) {
    console.error("Event creation error:", err);
    res.status(500).json({ msg: "Server error" });
  }
});

// Get all events
router.get("/", async (req, res) => {
  try {
    const events = await Event.find().sort({ createdAt: -1 });
    res.json(events);
  } catch (err) {
    console.error("Event fetch error:", err);
    res.status(500).json({ msg: "Failed to fetch events" });
  }
});

export default router;
