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

    const { title, message, type, contentId } = req.body;

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
      contentId: contentId || "", // Optional content ID
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

    let messageKey;
    let contentId;
    let messageParams = {};
    switch (contentType) {
      case "video":
        contentId = contentItem._id;
        messageKey = "notifications.video.new";
        messageParams = {
          titleEn: contentItem.title.en || contentItem.name,
          titleRu: contentItem.title.ru || contentItem.name,
        };
        break;
      case "news":
        contentId = contentItem._id;
        messageKey = "notifications.news.new";
        messageParams = {
          nameEn: contentItem.title.en || contentItem.name,
          nameRu: contentItem.title.ru || contentItem.name,
        };
        break;
      case "article":
        contentId = contentItem._id;
        messageKey = "notifications.article.new";
        messageParams = {
          titleEn: contentItem.title.en || contentItem.name,
          titleRu: contentItem.title.ru || contentItem.name,
        };
        break;
      case "product":
        contentId = contentItem._id;
        // For products, we need to store both language versions
        messageKey = "notifications.product.new";
        messageParams = {
          nameEn: contentItem.name.en || contentItem.name,
          nameRu: contentItem.name.ru || contentItem.name,
        };
        break;
      case "quiz":
        contentId = contentItem._id;
        messageKey = "notifications.quiz.new";
        messageParams = {
          titleEn: contentItem.title.en || contentItem.name,
          titleRu: contentItem.title.ru || contentItem.name,
        };
        break;
      default:
        contentId = contentItem._id;
        messageKey = "notifications.content.new";
        messageParams = {};
    }
    if (!contentId) {
      console.warn(
        "Content ID is missing, notifications will lack direct links"
      );
      contentId = ""; // Set empty string as fallback
    }

    const notifications = users.map((user) => ({
      userId: user._id,
      title: title, // You might want to make this a translation key too
      message: messageKey, // Store the translation key instead of actual message
      messageParams: messageParams, // Store parameters for translation
      type: contentType,
      contentId: contentId.toString(), // Convert to string to ensure compatibility
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

export const deleteAllNotifications = async (req, res) => {
  try {
    const userId = req.user.id;

    await Notification.deleteMany({ userId });
    res.json({ message: "All notifications deleted successfully" });
  } catch (error) {
    console.error("Error deleting all notifications:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
