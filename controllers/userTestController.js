import UserTest from "../models/UserTest.js";

// ➕ Save user test details
export const addUserTest = async (req, res) => {
  try {
    const { name, phone, email, plan } = req.body;

    if (!name || !phone || !email) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Default plan: "Basic" if not provided
    const newUser = new UserTest({
      name,
      phone,
      email,
      plan: plan || "Basic",
    });

    await newUser.save();
    res.status(201).json({ message: "Details saved successfully!" });
  } catch (error) {
    console.error("❌ Error saving user test:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// 📋 Get all user test submissions
export const getAllUserTests = async (req, res) => {
  try {
    const users = await UserTest.find().sort({ createdAt: -1 });
    res.status(200).json(users);
  } catch (error) {
    console.error("❌ Error fetching user tests:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
