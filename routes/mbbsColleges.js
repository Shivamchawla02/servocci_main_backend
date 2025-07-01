import express from "express";
import {
  getMBBSColleges,
  addMBBSCollege,
} from "../controllers/mbbsCollegeController.js";

const router = express.Router();

router.get("/", getMBBSColleges);
router.post("/", addMBBSCollege); // optional: admin route

export default router;
