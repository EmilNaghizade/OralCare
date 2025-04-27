// src/models/Notification.js
import mongoose from "mongoose";

const NotificationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      enum: ["video", "news", "article", "product", "quiz"],
      required: true,
    },
    contentId: {
      type: String, // Store the ID of the related content
      default: "", // Make it optional for backward compatibility
    },
    read: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// Create indexes for faster queries
NotificationSchema.index({ userId: 1, createdAt: -1 });
NotificationSchema.index({ userId: 1, read: 1 });
NotificationSchema.index({ type: 1, contentId: 1 }); // Add index for looking up by type and content ID

const Notification = mongoose.model("Notification", NotificationSchema);

export default Notification;
