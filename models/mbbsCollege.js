import mongoose from "mongoose";

const mbbsCollegeSchema = new mongoose.Schema({
  name: { type: String, required: true },
  city: { type: String, required: true },
  country: { type: String, required: true },
  duration: { type: String, required: true },
  usdFee: { type: String, required: true },
  inrFee: { type: String, required: true },
  logo: { type: String, required: false },
});

export default mongoose.model("MBBSCollege", mbbsCollegeSchema);
