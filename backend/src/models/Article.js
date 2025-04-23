// backend/src/models/Article.js
import mongoose from "mongoose";

const ArticleSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    thumbnail: {
      type: String,
      required: true,
    },
    readingTime: {
      type: Number,
      required: true,
    },
    // The timestamps option below automatically adds createdAt field
  },
  { timestamps: true }
);

// Create indexes for faster queries
ArticleSchema.index({ createdAt: -1 });

const Article = mongoose.model("Article", ArticleSchema);

export default Article;
