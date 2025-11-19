import express from "express";
import Blog from "../models/Blog.js";

const router = express.Router();

/**
 * 📌 Generate a unique slug
 */
const generateUniqueSlug = async (title) => {
  let baseSlug = title.toLowerCase().replace(/ /g, "-").replace(/[^\w-]+/g, "");
  let slug = baseSlug;
  let counter = 1;

  while (await Blog.findOne({ slug })) {
    slug = `${baseSlug}-${counter}`;
    counter++;
  }

  return slug;
};

/**
 * 📌 Add Blog (default: unapproved)
 */
router.post("/", async (req, res) => {
  try {
    const { title, category, description, content, authorName, authorRole } =
      req.body;

    if (!title || !category || !description || !content || !authorName || !authorRole) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const slug = await generateUniqueSlug(title);

    const blog = new Blog({
      title,
      category,
      description,
      content,
      authorName,
      authorRole,
      slug,
      approved: false,
      deleted: false,
    });

    await blog.save();
    res.status(201).json({
      message: "Blog created successfully (pending approval)!",
      blog,
    });
  } catch (err) {
    console.error("Error creating blog:", err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * 📌 Get all APPROVED blogs
 */
router.get("/", async (req, res) => {
  try {
    const blogs = await Blog.find({ approved: true, deleted: false }).sort({
      date: -1,
    });
    res.json(blogs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * 📌 Get PENDING blogs (admin)
 */
router.get("/pending", async (req, res) => {
  try {
    const blogs = await Blog.find({ approved: false, deleted: false }).sort({
      date: -1,
    });
    res.json(blogs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * 📌 Get all DELETED blogs
 */
router.get("/deleted/list", async (req, res) => {
  try {
    const blogs = await Blog.find({ deleted: true }).sort({ date: -1 });
    res.json(blogs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * 📌 Approve blog (admin)
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
 * 📌 Restore deleted blog
 */
router.patch("/:id/restore", async (req, res) => {
  try {
    const blog = await Blog.findByIdAndUpdate(
      req.params.id,
      { deleted: false },
      { new: true }
    );
    if (!blog) return res.status(404).json({ message: "Blog not found" });

    res.json({ message: "Blog restored successfully!", blog });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * 📌 Soft delete blog
 */
router.delete("/:id", async (req, res) => {
  try {
    const blog = await Blog.findByIdAndUpdate(
      req.params.id,
      { deleted: true },
      { new: true }
    );
    if (!blog)
      return res.status(404).json({ message: "Blog not found" });

    res.json({ message: "Blog moved to deleted list!", blog });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * 📌 Get a single blog by slug — MUST BE LAST
 */
router.get("/:slug", async (req, res) => {
  try {
    const blog = await Blog.findOne({
      slug: req.params.slug,
      approved: true,
      deleted: false,
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
