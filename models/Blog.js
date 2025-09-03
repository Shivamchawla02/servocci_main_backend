// models/Blog.js
const blogSchema = new mongoose.Schema({
  title: String,
  slug: String,
  description: String,
  content: String,
  category: String,
  author: {
    name: String,
    role: String,
  },
  image: String,
  date: { type: Date, default: Date.now },
  approved: { type: Boolean, default: false }, // 👈 Add this
});

export default mongoose.model("Blog", blogSchema);
