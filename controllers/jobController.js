import Job from "../models/Job.js";

export const createJob = async (req, res) => {
  try {
    const job = await Job.create(req.body);

    res.status(201).json({
  success: true,
  job,
});
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

export const getJobs = async (req, res) => {
  try {
    const jobs = await Job.find({
      active: true,
    }).sort({
      createdAt: -1,
    });

    res.status(200).json({
      success: true,
      jobs,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const updateJob = async (req, res) => {
  try {
    const job = await Job.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

   res.json({
  success: true,
  job,
});
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

export const deleteJob = async (req, res) => {
  try {
    await Job.findByIdAndDelete(req.params.id);

    res.json({
  success: true,
  message: "Job deleted successfully",
});
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};