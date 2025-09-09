import UserTest from "../models/UserTest.js";

export const addUserTest = async (req, res) => {
  try {
    const { name, phone, email } = req.body;
    if (!name || !phone || !email) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const newUser = new UserTest({ name, phone, email });
    await newUser.save();

    res.status(201).json({ message: "Details saved successfully!" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
