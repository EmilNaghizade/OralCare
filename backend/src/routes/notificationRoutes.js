// src/routes/notificationRoutes.js
import express from "express";
import * as notificationController from "../controllers/notificationController.js";
import protectRoute from "../middleware/auth.middleware.js";

const router = express.Router();

// Get user's notifications
router.get("/", protectRoute, notificationController.getUserNotifications);

// Mark a notification as read
router.put(
  "/:id/read",
  protectRoute,
  notificationController.markNotificationAsRead
);

// Mark all notifications as read
router.put(
  "/read-all",
  protectRoute,
  notificationController.markAllNotificationsAsRead
);

// Create a global notification (admin only)
router.post(
  "/global",
  protectRoute,
  notificationController.createGlobalNotification
);

router.post(
  "/content",
  protectRoute,
  notificationController.createContentNotification
);

router.delete(
  "/all",
  protectRoute,
  notificationController.deleteAllNotifications
);

router.delete("/:id", protectRoute, notificationController.deleteNotification);

export default router;
