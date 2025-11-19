// src/middleware/authMiddleware.js
import jwt from "jsonwebtoken";
import Student from "../models/Student.js"; // Import your Mongoose model

const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Unauthorized: No token provided" });
    }

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Fetch the student from the database
    const student = await Student.findById(decoded.id).select("-password");
    if (!student) {
      return res.status(401).json({ message: "Unauthorized: User not found" });
    }

    req.user = student; // attach user info to request
    next();
  } catch (error) {
    console.error("Auth Middleware Error:", error.message);
    return res.status(401).json({ message: "Unauthorized: Invalid token" });
  }
};

export default authMiddleware;
