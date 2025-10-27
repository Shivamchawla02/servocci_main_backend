import UserTest from "../models/UserTest.js";

// ➕ Save user test details
export const addUserTest = async (req, res) => {
  try {
    const { name, phone, email, plan } = req.body;

    if (!name || !phone || !email) {
      return res
        .status(400)
        .json({ success: false, message: "All fields are required" });
    }

    const newUser = new UserTest({
      name,
      phone,
      email,
      plan: plan || "Basic",
    });

    await newUser.save();

    res.status(201).json({
      success: true,
      message: "Details saved successfully!",
      data: newUser,
    });
  } catch (error) {
    console.error("❌ Error saving user test:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// 📋 Get all user test submissions
export const getAllUserTests = async (req, res) => {
  try {
    const users = await UserTest.find().sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      data: users,
    });
  } catch (error) {
    console.error("❌ Error fetching user tests:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// 📝 Update psychometric test report URL
export const updateUserTestReport = async (req, res) => {
  try {
    const { id } = req.params;
    const { reportUrl } = req.body;

    if (!reportUrl) {
      return res.status(400).json({
        success: false,
        message: "Report URL is required",
      });
    }

    const updatedUser = await UserTest.findByIdAndUpdate(
      id,
      { reportUrl },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Report URL updated successfully",
      data: updatedUser,
    });
  } catch (error) {
    console.error("❌ Error updating report URL:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};
