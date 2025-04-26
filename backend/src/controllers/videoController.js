import Video from "../models/Video.js";
import User from "../models/User.js";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import mongoose from "mongoose";
import { createContentNotification } from "./notificationController.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Get all videos
export const getAllVideos = async (req, res) => {
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
};

// Create a new video
export const createVideo = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ error: "Not authorized to add videos" });
    }

    const { title, description, category, duration } = req.body;
    let tags = [];
    if (req.body.tags) {
      try {
        tags = JSON.parse(req.body.tags);
        // Ensure tags is an array (in case it's not sent as an array from frontend)
        if (!Array.isArray(tags)) {
          tags = [];
        }
      } catch (err) {
        console.error("Error parsing tags JSON:", err);
        // If there's an error parsing, set tags to an empty array
        tags = [];
      }
    }

    // Check if files were uploaded
    if (!req.files || !req.files.video || !req.files.thumbnail) {
      return res
        .status(400)
        .json({ error: "Both video and thumbnail files are required" });
    }

    const videoFile = req.files.video[0];
    const thumbnailFile = req.files.thumbnail[0];

    // Create paths that will be accessible from the frontend
    const videoUrl = `/uploads/videos/${videoFile.filename}`;
    const thumbnailUrl = `/uploads/thumbnails/${thumbnailFile.filename}`;


    const video = new Video({
      title,
      description,
      videoUrl,
      thumbnailUrl,
      duration: duration || 0, // Default to 0 if not provided
      category,
      tags,
      isPublished: true,
    });

    await createContentNotification("New Video Available", "video", video);

    await video.save();

    res.status(201).json(video);
  } catch (error) {
    console.error("Error creating video:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Update a video
export const updateVideo = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ error: "Not authorized to update videos" });
    }

    const videoId = req.params.id;
    const { title, description, category, duration } = req.body;

    // Parse tags from JSON string to an array
    let tags = [];
    if (req.body.tags) {
      try {
        tags = JSON.parse(req.body.tags);
        // Ensure tags is an array (in case it's not sent as an array from frontend)
        if (!Array.isArray(tags)) {
          tags = [];
        }
      } catch (err) {
        console.error("Error parsing tags JSON:", err);
        // If there's an error parsing, set tags to an empty array
        tags = [];
      }
    }

    // Find the existing video
    const video = await Video.findById(videoId);
    if (!video) {
      return res.status(404).json({ error: "Video not found" });
    }

    // Update the basic fields
    video.title = title || video.title;
    video.description = description || video.description;
    video.category = category || video.category;
    video.duration = duration ? Number(duration) : video.duration;
    video.tags = tags; // Replace existing tags with new tags

    // Update files if provided
    if (req.files) {
      if (req.files.video) {
        // Update video file and delete old one if it exists
        try {
          const oldVideoPath = path.join(__dirname, "../..", video.videoUrl);
          if (fs.existsSync(oldVideoPath)) {
            fs.unlinkSync(oldVideoPath);
          }
        } catch (err) {
          console.error("Error deleting old video file:", err);
          // Continue even if deletion fails
        }

        const videoFile = req.files.video[0];
        video.videoUrl = `/uploads/videos/${videoFile.filename}`;
      }

      if (req.files.thumbnail) {
        // Update thumbnail file and delete old one if it exists
        try {
          const oldThumbnailPath = path.join(
            __dirname,
            "../..",
            video.thumbnailUrl
          );
          if (fs.existsSync(oldThumbnailPath)) {
            fs.unlinkSync(oldThumbnailPath);
          }
        } catch (err) {
          console.error("Error deleting old thumbnail file:", err);
          // Continue even if deletion fails
        }

        const thumbnailFile = req.files.thumbnail[0];
        video.thumbnailUrl = `/uploads/thumbnails/${thumbnailFile.filename}`;
      }
    }

    await video.save();
    res.json(video);
  } catch (error) {
    console.error("Error updating video:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Get a single video
export const getVideo = async (req, res) => {
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
};

// Delete a video
export const deleteVideo = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ error: "Not authorized to delete videos" });
    }

    const video = await Video.findById(req.params.id);
    if (!video) {
      return res.status(404).json({ error: "Video not found" });
    }

    // Delete files from the server
    try {
      const videoPath = path.join(__dirname, "../..", video.videoUrl);
      const thumbnailPath = path.join(__dirname, "../..", video.thumbnailUrl);

      if (fs.existsSync(videoPath)) {
        fs.unlinkSync(videoPath);
      }
      if (fs.existsSync(thumbnailPath)) {
        fs.unlinkSync(thumbnailPath);
      }
    } catch (err) {
      console.error("Error deleting files:", err);
      // Continue even if file deletion fails
    }

    await Video.findByIdAndDelete(req.params.id);
    res.json({ message: "Video removed successfully" });
  } catch (error) {
    console.error("Error deleting video:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Get watched videos for the current user
export const getWatchedVideos = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

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
};

export const markVideoAsWatched = async (req, res) => {
  try {
    const videoId = req.params.videoId;
    const user = await User.findById(req.user.id);

    // Check if video is already marked as watched
    if (user.watchedVideos.includes(videoId)) {
      return res.json({ message: "Video already marked as watched" });
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
};

