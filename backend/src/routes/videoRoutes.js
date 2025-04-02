// routes/videoRoutes.js
import express from "express";
import Video from "../models/Video.js";
import User from "../models/User.js"; // <-- Import User model
import protectRoute from "../middleware/auth.middleware.js";

const router = express.Router();

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
    const { videoId } = req.params;
    const userId = req.user._id; // Get user ID from protectRoute

    // Validate videoId (optional)
    const videoExists = await Video.findById(videoId);
    if (!videoExists) {
      return res.status(404).json({ message: "Video not found." });
    }

    // Use $addToSet to add the videoId to the user's watchedVideos array
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $addToSet: { watchedVideos: videoId } },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found." });
    }

    console.log(`User ${userId} marked video ${videoId} as watched.`);
    res.status(200).json({ message: "Video marked as watched." });
  } catch (error) {
    console.error("Error marking video as watched:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// TODO: Add routes for creating/updating/deleting videos if needed (likely admin only)

export default router;
