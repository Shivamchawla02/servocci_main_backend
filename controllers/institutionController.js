import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import Institution from "../models/Institution.js";

const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret_here";

export const registerInstitution = async (req, res) => {
  const {
    name,
    type,
    affiliation,
    address,
    state,
    city,
    pincode,
    phone,
    email,
    password,
  } = req.body;

  try {
    const existing = await Institution.findOne({ email });
    if (existing) return res.status(400).json({ msg: "Email already registered" });

    const hashedPassword = await bcrypt.hash(password, 10);

    const newInstitution = new Institution({
      name,
      type,
      affiliation,
      address,
      state,
      city,
      pincode,
      phone,
      email,
      password: hashedPassword,
    });

    await newInstitution.save();

    res.status(201).json({ msg: "Institution registered successfully" });
  } catch (err) {
    console.error("Institution register error:", err);
    res.status(500).json({ msg: "Server error" });
  }
};

export const loginInstitution = async (req, res) => {
  const { email, password } = req.body;

  try {
    const institution = await Institution.findOne({ email });
    if (!institution) return res.status(400).json({ msg: "Invalid email or password" });

    const isMatch = await bcrypt.compare(password, institution.password);
    if (!isMatch) return res.status(400).json({ msg: "Invalid email or password" });

    const token = jwt.sign({ id: institution._id, email: institution.email }, JWT_SECRET, {
      expiresIn: "1d",
    });

    res.json({
      token,
      user: {
        id: institution._id,
        name: institution.name,
        email: institution.email,
        phone: institution.phone,
        type: institution.type,
      },
    });
  } catch (err) {
    console.error("Institution login error:", err);
    res.status(500).json({ msg: "Server error" });
  }
};
