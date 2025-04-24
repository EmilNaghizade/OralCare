// src/controllers/notificationController.js
import Notification from "../models/Notification.js";
import User from "../models/User.js";

// Get all notifications for the current user
export const getUserNotifications = async (req, res) => {
  try {
    const userId = req.user.id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const notifications = await Notification.find({ userId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const totalNotifications = await Notification.countDocuments({ userId });
    const unreadCount = await Notification.countDocuments({
      userId,
      read: false,
    });

    res.json({
      notifications,
      totalNotifications,
      unreadCount,
      currentPage: page,
      totalPages: Math.ceil(totalNotifications / limit),
    });
  } catch (error) {
    console.error("Error fetching notifications:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Mark a notification as read
export const markNotificationAsRead = async (req, res) => {
  try {
    const notificationId = req.params.id;
    const userId = req.user.id;

    const notification = await Notification.findOneAndUpdate(
      { _id: notificationId, userId },
      { $set: { read: true } },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ error: "Notification not found" });
    }

    res.json(notification);
  } catch (error) {
    console.error("Error marking notification as read:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Mark all notifications as read
export const markAllNotificationsAsRead = async (req, res) => {
  try {
    const userId = req.user.id;

    await Notification.updateMany(
      { userId, read: false },
      { $set: { read: true } }
    );

    res.json({ message: "All notifications marked as read" });
  } catch (error) {
    console.error("Error marking all notifications as read:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Create a new notification for all users
export const createGlobalNotification = async (req, res) => {
  try {
    // Only allow admins to create global notifications
    if (req.user.role !== "admin") {
      return res.status(403).json({ error: "Not authorized" });
    }

    const { title, message, type } = req.body;

    if (!title || !message || !type) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Get all user IDs
    const users = await User.find({}, "_id");

    // Create a notification for each user
    const notifications = users.map((user) => ({
      userId: user._id,
      title,
      message,
      type,
    }));

    await Notification.insertMany(notifications);

    res.status(201).json({
      message: `Notification created for ${users.length} users`,
    });
  } catch (error) {
    console.error("Error creating global notification:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Utility function to create a notification for new content
export const createContentNotification = async (
  title,
  contentType,
  contentItem
) => {
  try {
    const users = await User.find({}, "_id");

    let message;
    switch (contentType) {
      case "video":
        message = `New video added: ${contentItem.title}`;
        break;
      case "news":
        message = `New news: ${contentItem.title}`;
        break;
      case "article":
        message = `New article published: ${contentItem.title}`;
        break;
      case "product":
        message = `New product available: ${contentItem.name}`;
        break;
      default:
        message = `New content added`;
    }

    const notifications = users.map((user) => ({
      userId: user._id,
      title,
      message,
      type: contentType,
    }));

    await Notification.insertMany(notifications);
    console.log(
      `Created ${notifications.length} notifications for new ${contentType}`
    );
    return true;
  } catch (error) {
    console.error(`Error creating ${contentType} notifications:`, error);
    return false;
  }
};

export const deleteNotification = async (req, res) => {
  try {
    const notificationId = req.params.id;
    const userId = req.user.id;

    const notification = await Notification.findOneAndDelete({
      _id: notificationId,
      userId,
    });
    if (!notification) {
      return res.status(404).json({ error: "Notification not found" });
    }
    res.json({ message: "Notification deleted successfully" });
  } catch (error) {
    console.error("Error deleting notification:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
