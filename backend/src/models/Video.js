// backend/src/models/Video.js (already in your codebase)
import mongoose from "mongoose";

const videoSchema = new mongoose.Schema(
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
    videoUrl: {
      type: String,
      required: true,
    },
    thumbnailUrl: {
      type: String,
      required: true,
    },
    duration: {
      type: Number, // Duration in seconds
      required: true,
      min: 0,
    },
    category: {
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
    tags: [
      {
        type: String,
        trim: true,
      },
    ],
  },
  { timestamps: true }
);

const Video = mongoose.model("Video", videoSchema);

export default Video;
