import express from "express";
import Event from "../models/Event.js";

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const { title, date, description, coverImage, extraImages } = req.body;

    if (!title || !date || !description || !coverImage) {
      return res.status(400).json({ msg: "All required fields missing" });
    }

    const event = new Event({
      title,
      date,
      description,
      coverImage,
      extraImages,
    });

    await event.save();
    res.json({ msg: "Event created successfully", event });

  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
});

export default router;
