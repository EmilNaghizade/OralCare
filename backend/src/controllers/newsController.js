// backend/src/controllers/newsController.js
import News from "../models/News.js";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Get all news articles
export const getAllNews = async (req, res) => {
  try {
    const page = req.query.page ? Number(req.query.page) : 1;
    const limit = req.query.limit ? Number(req.query.limit) : 10;
    const skip = (page - 1) * limit;

    const newsItems = await News.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await News.countDocuments();

    res.json({
      news: newsItems,
      totalNews: total,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("Error fetching news:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Get a single news item by ID
export const getNewsById = async (req, res) => {
  try {
    const newsItem = await News.findById(req.params.id);
    if (!newsItem) {
      return res.status(404).json({ error: "News item not found" });
    }

    res.json(newsItem);
  } catch (error) {
    console.error("Error fetching news item:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Create a new news item (admin only)
export const createNews = async (req, res) => {
  try {
    if (!req.user || req.user.role !== "admin") {
      return res.status(403).json({ error: "Not authorized to create news" });
    }

    const { title, description, readingTime } = req.body;

    // Check if thumbnail file was uploaded
    if (!req.file) {
      return res.status(400).json({ error: "Thumbnail image is required" });
    }

    // Create path for thumbnail that will be accessible from frontend
    const thumbnailUrl = `/uploads/thumbnails/${req.file.filename}`;

    const newsItem = new News({
      title,
      description,
      thumbnail: thumbnailUrl,
      readingTime: Number(readingTime) || 3,
    });

    await newsItem.save();
    res.status(201).json(newsItem);
  } catch (error) {
    console.error("Error creating news item:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Update a news item (admin only)
export const updateNews = async (req, res) => {
  try {
    if (!req.user || req.user.role !== "admin") {
      return res.status(403).json({ error: "Not authorized to update news" });
    }

    const { title, description, readingTime } = req.body;

    // Find the existing news item
    const newsItem = await News.findById(req.params.id);
    if (!newsItem) {
      return res.status(404).json({ error: "News item not found" });
    }

    // Update basic fields
    if (title) newsItem.title = title;
    if (description) newsItem.description = description;
    if (readingTime) newsItem.readingTime = Number(readingTime);

    // Update thumbnail if provided
    if (req.file) {
      // Delete old thumbnail if it exists
      try {
        const oldThumbnailPath = path.join(
          __dirname,
          "../..",
          newsItem.thumbnail
        );
        if (fs.existsSync(oldThumbnailPath)) {
          fs.unlinkSync(oldThumbnailPath);
        }
      } catch (err) {
        console.error("Error deleting old thumbnail:", err);
        // Continue even if deletion fails
      }

      newsItem.thumbnail = `/uploads/thumbnails/${req.file.filename}`;
    }

    await newsItem.save();
    res.json(newsItem);
  } catch (error) {
    console.error("Error updating news item:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Delete a news item (admin only)
export const deleteNews = async (req, res) => {
  try {
    if (!req.user || req.user.role !== "admin") {
      return res.status(403).json({ error: "Not authorized to delete news" });
    }

    const newsItem = await News.findById(req.params.id);
    if (!newsItem) {
      return res.status(404).json({ error: "News item not found" });
    }

    // Delete thumbnail file
    try {
      const thumbnailPath = path.join(__dirname, "../..", newsItem.thumbnail);
      if (fs.existsSync(thumbnailPath)) {
        fs.unlinkSync(thumbnailPath);
      }
    } catch (err) {
      console.error("Error deleting thumbnail:", err);
      // Continue even if file deletion fails
    }

    await News.findByIdAndDelete(req.params.id);
    res.json({ message: "News item deleted successfully" });
  } catch (error) {
    console.error("Error deleting news item:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
