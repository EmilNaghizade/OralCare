// backend/src/controllers/newsController.js
import News from "../models/News.js";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import { createContentNotification } from "./notificationController.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Get all news articles
export const getAllNews = async (req, res) => {
  try {
    const page = req.query.page ? Number(req.query.page) : 1;
    const limit = req.query.limit ? Number(req.query.limit) : 10;
    const skip = (page - 1) * limit;

    const language =
      req.query.lang ||
      req.headers["accept-language"]?.split(",")[0].substring(0, 2) ||
      "en";

    const newsItems = await News.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const transformedNews = newsItems.map((news) => ({
      ...news.toObject(),
      title: news.title[language] || news.title.en,
      description: news.description[language] || news.description.en,
      // Include all language versions in separate properties
      titleTranslations: news.title,
      descriptionTranslations: news.description,
    }));

    const total = await News.countDocuments();

    res.json({
      news: transformedNews,
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

    // Get the preferred language from query params or headers
    const language =
      req.query.lang ||
      req.headers["accept-language"]?.split(",")[0].substring(0, 2) ||
      "en";

    const transformedNews = {
      ...newsItem.toObject(),
      title: newsItem.title[language] || newsItem.title.en,
      description: newsItem.description[language] || newsItem.description.en,
      titleTranslations: newsItem.title,
      descriptionTranslations: newsItem.description,
    };

    res.json(transformedNews);
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

    let parsedTitle = title;
    let parsedDescription = description;

    if (typeof title === "string") {
      try {
        parsedTitle = JSON.parse(title);
      } catch (e) {
        parsedTitle = { en: title, ru: title };
      }
    }

    if (typeof description === "string") {
      try {
        parsedDescription = JSON.parse(description);
      } catch (e) {
        parsedDescription = { en: description, ru: description };
      }
    }

    // Validate that we have both language versions
    if (
      !parsedTitle.en ||
      !parsedTitle.ru ||
      !parsedDescription.en ||
      !parsedDescription.ru
    ) {
      return res.status(400).json({
        error:
          "Title and description must be provided in both English and Russian",
      });
    }
    // Check if thumbnail file was uploaded
    if (!req.file) {
      return res.status(400).json({ error: "Thumbnail image is required" });
    }

    // Create path for thumbnail that will be accessible from frontend
    const thumbnailUrl = `/uploads/thumbnails/${req.file.filename}`;

    const newsItem = new News({
      title: parsedTitle,
      description: parsedDescription,
      thumbnail: thumbnailUrl,
      readingTime: Number(readingTime) || 3,
    });

    await createContentNotification("New News Available", "news", newsItem);

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

    let parsedTitle = title;
    let parsedDescription = description;

    if (typeof title === "string") {
      try {
        parsedTitle = JSON.parse(title);
      } catch (e) {
        parsedTitle = {
          ...newsItem.title,
          en: title,
        };
      }
    }

    if (typeof description === "string") {
      try {
        parsedDescription = JSON.parse(description);
      } catch (e) {
        parsedDescription = {
          ...newsItem.description,
          en: description,
        };
      }
    }

    // Update basic fields
    if (parsedTitle) {
      if (!parsedTitle.en || !parsedTitle.ru) {
        return res.status(400).json({
          error: "Title must be provided in both English and Russian",
        });
      }
      newsItem.title = parsedTitle;
    }

    if (parsedDescription) {
      if (!parsedDescription.en || !parsedDescription.ru) {
        return res.status(400).json({
          error: "Description must be provided in both English and Russian",
        });
      }
      newsItem.description = parsedDescription;
    }
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
