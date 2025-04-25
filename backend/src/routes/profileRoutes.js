// backend/src/routes/profileRoutes.js
import express from "express";
import protectRoute from "../middleware/auth.middleware.js";
import * as profileController from "../controllers/profileController.js";

const router = express.Router();

// New endpoint: Upload profile photo via base64 JSON payload
router.post(
  "/upload-photo-base64-json",
  protectRoute,
  profileController.uploadPhotoBase64
);

// Delete profile photo endpoint (fixed)
router.delete(
  "/delete-photo",
  protectRoute,
  profileController.deleteProfilePhoto
);

// Get user profile endpoint (unchanged)
router.get("/profile", protectRoute, profileController.getUserProfile);

// Debug endpoint (unchanged)
router.get("/debug/check-image/:filename", profileController.checkImage);

export default router;
