import MBBSCollege from "../models/mbbsCollege.js";

// GET all MBBS Abroad colleges
export const getMBBSColleges = async (req, res) => {
  try {
    const colleges = await MBBSCollege.find();
    res.status(200).json(colleges);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch MBBS colleges" });
  }
};

// POST a new MBBS Abroad college (optional: admin use)
export const addMBBSCollege = async (req, res) => {
  try {
    const newCollege = new MBBSCollege(req.body);
    await newCollege.save();
    res.status(201).json(newCollege);
  } catch (error) {
    res.status(500).json({ message: "Failed to add MBBS college" });
  }
};
