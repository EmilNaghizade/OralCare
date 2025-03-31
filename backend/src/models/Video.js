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
      required: false, // Optional description
      trim: true,
    },
    videoUrl: { // URL to the video file/stream
      type: String,
      required: true,
    },
    thumbnailUrl: { // Optional thumbnail image URL
      type: String,
      required: false,
    },
    duration: { // Optional duration in seconds or string format
        type: String, // Or Number for seconds
        required: false,
    },
    // Add other relevant fields like category, tags etc. if needed
  },
  { timestamps: true }
);

const Video = mongoose.model("Video", videoSchema);

export default Video;