// models/Video.js
import mongoose from "mongoose";

const videoSchema = new mongoose.Schema(
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
      type: String,
      required: true,
      trim: true,
    },
    tags: [
      {
        type: String,
        trim: true,
      },
    ],
    isPublished: {
      type: Boolean,
      default: false,
    },
    fileSize: {
      type: Number, // Size in bytes
      required: true,
    },
    format: {
      type: String,
      required: true,
      trim: true,
    },
  },
  { timestamps: true }
);

const Video = mongoose.model("Video", videoSchema);

export default Video;
