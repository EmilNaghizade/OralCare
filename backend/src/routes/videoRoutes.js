// routes/videoRoutes.js
import express from "express";
import Video from "../models/Video.js";
import User from "../models/User.js"; // <-- Import User model
import protectRoute from "../middleware/auth.middleware.js";

const router = express.Router();

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

// --- GET all videos (add pagination similar to blogs if needed) ---
router.get("/", async (req, res) => {
  try {
    // Basic implementation - enhance with pagination/filtering later
    const videos = await Video.find().sort({ createdAt: -1 });
    res.json({ videos });
  } catch (error) {
    console.error("Error fetching videos:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// --- GET a single video by ID ---
router.get("/:videoId", async (req, res) => {
  try {
    const video = await Video.findById(req.params.videoId);
    if (!video) {
      return res.status(404).json({ message: "Video not found" });
    }
    res.json(video);
  } catch (error) {
    console.error("Error fetching video:", error);
    if (error.kind === "ObjectId") {
      // Handle invalid ID format
      return res.status(400).json({ message: "Invalid video ID format" });
    }
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

// Add this endpoint to your videoRoutes.js file

// --- NEW: Endpoint to get all watched videos for a user ---

// TODO: Add routes for creating/updating/deleting videos if needed (likely admin only)

export default router;
