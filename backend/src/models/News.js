// backend/src/models/News.js
import mongoose from "mongoose";

const NewsSchema = new mongoose.Schema(
  {
    title: {
      en: {
        type: String,
        required: true,
        trim: true,
      },
      ru: {
        type: String,
        required: true,
        trim: true,
      },
    },
    description: {
      en: {
        type: String,
        required: true,
        trim: true,
      },
      ru: {
        type: String,
        required: true,
        trim: true,
      },
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
NewsSchema.index({ createdAt: -1 });

const News = mongoose.model("News", NewsSchema);

export default News;
