
// backend/src/controllers/articleController.js
import Article from "../models/Article.js";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import { createContentNotification } from "./notificationController.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Get all articles
export const getAllArticles = async (req, res) => {
  try {
    const page = req.query.page ? Number(req.query.page) : 1;
    const limit = req.query.limit ? Number(req.query.limit) : 10;
    const skip = (page - 1) * limit;
    
    const articles = await Article.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    
    const total = await Article.countDocuments();
    
    res.json({
      articles,
      totalArticles: total,
      currentPage: page,
      totalPages: Math.ceil(total / limit)
    });
  } catch (error) {
    console.error("Error fetching articles:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Get a single article by ID
export const getArticleById = async (req, res) => {
  try {
    const article = await Article.findById(req.params.id);
    if (!article) {
      return res.status(404).json({ error: "Article not found" });
    }
    
    res.json(article);
  } catch (error) {
    console.error("Error fetching article:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Create a new article (admin only)
export const createArticle = async (req, res) => {
  try {
    if (!req.user || req.user.role !== "admin") {
      return res.status(403).json({ error: "Not authorized to create articles" });
    }
    
    const { title, description, readingTime } = req.body;
    
    // Check if thumbnail file was uploaded
    if (!req.file) {
      return res.status(400).json({ error: "Thumbnail image is required" });
    }
    
    // Create path for thumbnail that will be accessible from frontend
    const thumbnailUrl = `/uploads/thumbnails/${req.file.filename}`;
    
    const article = new Article({
      title,
      description,
      thumbnail: thumbnailUrl,
      readingTime: Number(readingTime) || 5,
    });

    await createContentNotification(
      "New Article Available",
      "article", 
      article
    );
    
    await article.save();
    res.status(201).json(article);
  } catch (error) {
    console.error("Error creating article:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Update an article (admin only)
export const updateArticle = async (req, res) => {
  try {
    if (!req.user || req.user.role !== "admin") {
      return res.status(403).json({ error: "Not authorized to update articles" });
    }
    
    const { title, description, readingTime } = req.body;
    
    // Find the existing article
    const article = await Article.findById(req.params.id);
    if (!article) {
      return res.status(404).json({ error: "Article not found" });
    }
    
    // Update basic fields
    if (title) article.title = title;
    if (description) article.description = description;
    if (readingTime) article.readingTime = Number(readingTime);
    
    // Update thumbnail if provided
    if (req.file) {
      // Delete old thumbnail if it exists
      try {
        const oldThumbnailPath = path.join(__dirname, "../..", article.thumbnail);
        if (fs.existsSync(oldThumbnailPath)) {
          fs.unlinkSync(oldThumbnailPath);
        }
      } catch (err) {
        console.error("Error deleting old thumbnail:", err);
        // Continue even if deletion fails
      }
      
      article.thumbnail = `/uploads/thumbnails/${req.file.filename}`;
    }
    
    await article.save();
    res.json(article);
  } catch (error) {
    console.error("Error updating article:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Delete an article (admin only)
export const deleteArticle = async (req, res) => {
  try {
    if (!req.user || req.user.role !== "admin") {
      return res.status(403).json({ error: "Not authorized to delete articles" });
    }
    
    const article = await Article.findById(req.params.id);
    if (!article) {
      return res.status(404).json({ error: "Article not found" });
    }
    
    // Delete thumbnail file
    try {
      const thumbnailPath = path.join(__dirname, "../..", article.thumbnail);
      if (fs.existsSync(thumbnailPath)) {
        fs.unlinkSync(thumbnailPath);
      }
    } catch (err) {
      console.error("Error deleting thumbnail:", err);
      // Continue even if file deletion fails
    }
    
    await Article.findByIdAndDelete(req.params.id);
    res.json({ message: "Article deleted successfully" });
  } catch (error) {
    console.error("Error deleting article:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};