import express from "express";
import Blog from "../models/Blog.js";

const router = express.Router();

/**
 * 📌 Add Blog (default: unapproved, no image)
 */
router.post("/", async (req, res) => {
  try {
    const { title, category, description, content, authorName, authorRole } =
      req.body;

    const blog = new Blog({
      title,
      category,
      description,
      content,
      author: { name: authorName, role: authorRole },
      slug: title.toLowerCase().replace(/ /g, "-"),
      approved: false, // 👈 Default: not approved
    });

    await blog.save();
    res
      .status(201)
      .json({ message: "Blog created successfully (pending approval)!", blog });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * 📌 Get all APPROVED blogs (for public site)
 */
router.get("/", async (req, res) => {
  try {
    const blogs = await Blog.find({ approved: true }).sort({ date: -1 });
    res.json(blogs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * 📌 Get PENDING blogs (Admin only)
 */
router.get("/pending", async (req, res) => {
  try {
    const blogs = await Blog.find({ approved: false }).sort({ date: -1 });
    res.json(blogs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * 📌 Approve Blog (Admin action)
 */
router.patch("/:id/approve", async (req, res) => {
  try {
    const blog = await Blog.findByIdAndUpdate(
      req.params.id,
      { approved: true },
      { new: true }
    );
    if (!blog) return res.status(404).json({ message: "Blog not found" });
    res.json({ message: "Blog approved successfully!", blog });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * 📌 Get single Blog by slug (only approved blogs are visible publicly)
 */
router.get("/:slug", async (req, res) => {
  try {
    const blog = await Blog.findOne({
      slug: req.params.slug,
      approved: true,
    });
    if (!blog)
      return res
        .status(404)
        .json({ message: "Blog not found or not approved yet" });
    res.json(blog);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
