// routes/videoRoutes.js
import express from "express";
import Video from "../models/Video.js";
import User from "../models/User.js"; // <-- Import User model
import protectRoute from "../middleware/auth.middleware.js";
import cloudinary from "../lib/cloudinary.js";

const router = express.Router();

// Get all videos
router.get("/", async (req, res) => {
  try {
    const page = req.query.page ? Number(req.query.page) : 1;
    const limit = req.query.limit ? Number(req.query.limit) : 10;
    const skip = (page - 1) * limit;

    const videos = await Video.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Video.countDocuments();

    res.json({
      videos,
      totalVideos: total,
    });
  } catch (error) {
    console.error("Error fetching videos:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Create video (admin only)
router.post("/", protectRoute, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ error: "Not authorized to create videos" });
    }

    const { title, description, category, tags, videoData, thumbnailData } =
      req.body;

    // Validate required fields
    if (!title || !description || !videoData || !thumbnailData) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Upload video to cloudinary
    const videoUpload = await cloudinary.uploader.upload(videoData, {
      resource_type: "video",
      folder: "oralcare_videos",
    });

    // Upload thumbnail to cloudinary
    const thumbnailUpload = await cloudinary.uploader.upload(thumbnailData, {
      folder: "oralcare_thumbnails",
    });

    // Create new video
    const video = new Video({
      title,
      description,
      videoUrl: videoUpload.secure_url,
      thumbnailUrl: thumbnailUpload.secure_url,
      duration: Math.round(videoUpload.duration || 0),
      category: category || "General",
      tags: tags || [],
      isPublished: true,
      fileSize: videoUpload.bytes,
      format: videoUpload.format,
    });

    await video.save();
    res.status(201).json(video);
  } catch (error) {
    console.error("Error creating video:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Get a single video
router.get("/:id", async (req, res) => {
  try {
    const video = await Video.findById(req.params.id);
    if (!video) {
      return res.status(404).json({ error: "Video not found" });
    }
    res.json(video);
  } catch (error) {
    console.error("Error fetching video:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Delete video (admin only)
router.delete("/:id", protectRoute, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ error: "Not authorized to delete videos" });
    }

    const video = await Video.findById(req.params.id);
    if (!video) {
      return res.status(404).json({ error: "Video not found" });
    }

    // Extract public IDs from URLs
    const videoPublicId = video.videoUrl.split("/").slice(-1)[0].split(".")[0];
    const thumbnailPublicId = video.thumbnailUrl
      .split("/")
      .slice(-1)[0]
      .split(".")[0];

    // Delete from cloudinary
    await cloudinary.uploader.destroy(videoPublicId, {
      resource_type: "video",
    });
    await cloudinary.uploader.destroy(thumbnailPublicId);

    await Video.findByIdAndDelete(req.params.id);
    res.json({ message: "Video removed successfully" });
  } catch (error) {
    console.error("Error deleting video:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/watched", protectRoute, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select(
      "name email watchedVideos finishedQuizzes role"
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      watchedVideosId: user.watchedVideos || [],
      count: (user.watchedVideos || []).length,
    });
  } catch (error) {
    console.error("Error fetching watched videos:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// --- NEW: Endpoint to mark a video as watched ---
router.post("/:videoId/watch", protectRoute, async (req, res) => {
  try {
    const videoId = req.params.videoId;
    const user = await User.findById(req.user.id).select(
      "name email watchedVideos finishedQuizzes role"
    );

    // Use $addToSet to add the videoId to the user's watchedVideos array
    if (user.watchedVideos.includes(videoId)) {
      return res.json({ message: "Quiz already marked as finished" });
    }

    user.watchedVideos.push(videoId);
    await user.save();

    res.json({
      message: "Video marked as watched.",
      watchedCount: user.watchedVideos.length,
    });
  } catch (error) {
    console.error("Error marking video as watched:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
