import FreeCounsellingRequest from "../models/FreeCounsellingRequest.js";

export const createBooking = async (req, res) => {
  try {
    const { name, phone, email, preferredDate, message } = req.body;

    if (!name || !phone || !preferredDate) {
      return res.status(400).json({ msg: "Name, phone, and preferred date are required." });
    }

    const newBooking = new FreeCounsellingRequest({
      name,
      phone,
      email,
      preferredDate,
      message
    });

    await newBooking.save();

    return res.status(201).json({ msg: "Your free counselling request has been submitted successfully." });
  } catch (err) {
    console.error("FreeCounselling create error:", err);
    return res.status(500).json({ msg: "Server error" });
  }
};
