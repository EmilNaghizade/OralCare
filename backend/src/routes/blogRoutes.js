import express from "express";
import cloudinary from "../lib/cloudinary.js";
import Blog from "../models/Blog.js";
import User from "../models/User.js";
import protectRoute from "../middleware/auth.middleware.js";

const router = express.Router();

//create a blog
router.post("/", protectRoute, async (req, res) => {
  try {
    const { title, content, image } = req.body;

    if (!title || !content || !image) {
      return res.status(400).json({ error: "All fields are required" });
    }

    //upload image
    const uploadResponse = await cloudinary.uploader.upload(image);
    const imageUrl = uploadResponse.secure_url;
    //create a blog
    const newBlog = new Blog({
      title,
      content,
      image: imageUrl,
    });

    await newBlog.save();

    res.status(201).json(newBlog);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

//get all blogs
//pagination
router.get("/", async (req, res) => {
  try {
    const page = req.query.page ? Number(req.query.page) : 1;
    const limit = req.query.limit ? Number(req.query.limit) : 5;
    const skip = (page - 1) * limit;
    const blogs = await Blog.find()
      .sort({ createdAt: -1 }) //desc
      .skip(skip) //skip the first n blogs
      .limit(limit); //limit the number of blogs to send

    const total = await Blog.countDocuments();
    res.json({
      blogs,
      totalBlogs: total,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/:id", protectRoute, async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) {
      return res.status(404).json({ error: "Blog not found" });
    }

    //delete image from cloudinary
    if (blog.image && blog.image.includes("cloudinary")) {
      const publicId = blog.image.match(/upload\/(.*?)(\/|\.)/)[1];
      await cloudinary.uploader.destroy(publicId);
    }

    await blog.remove();
    res.json({ message: "Blog removed" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

//user read blog
router.post("/:blogId/read", protectRoute, async (req, res) => {
  try{
    const { blogId } = req.params;
    const userId = req.user._id;

   // Validate blogId (optional but good practice)
   const blogExists = await Blog.findById(blogId);
   if (!blogExists) {
       return res.status(404).json({ message: "Blog not found." });
   }

   // Use $addToSet to add the blogId to the user's readArticles array
   // $addToSet prevents duplicates automatically
   const updatedUser = await User.findByIdAndUpdate(
       userId,
       { $addToSet: { readArticles: blogId } },
       { new: true } // Return the updated user document (optional)
   );

   if (!updatedUser) {
       return res.status(404).json({ message: "User not found." });
   }

   console.log(`User ${userId} marked blog ${blogId} as read.`);
   res.status(200).json({ message: "Article marked as read." });

 } catch (error) {
   console.error("Error marking article as read:", error);
   res.status(500).json({ error: "Internal server error" });
 }
}
);

export default router;
