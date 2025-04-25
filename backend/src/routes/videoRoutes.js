// backend/src/routes/videoRoutes.js
import express from "express";
import protectRoute from "../middleware/auth.middleware.js";
import upload from "../middleware/multer.js";
import * as videoController from "../controllers/videoController.js";

const router = express.Router();

// Get all videos with pagination and filtering
router.get("/", videoController.getAllVideos);

// Create video (admin only)
router.post(
  "/",
  protectRoute,
  upload.fields([
    { name: "video", maxCount: 1 },
    { name: "thumbnail", maxCount: 1 },
  ]),
  videoController.createVideo
);

// Update video (admin only)
router.put(
  "/:id",
  protectRoute,
  upload.fields([
    { name: "video", maxCount: 1 },
    { name: "thumbnail", maxCount: 1 },
  ]),
  videoController.updateVideo
);

// Get a single video
router.get("/:id", videoController.getVideo);

// Delete video (admin only)
router.delete("/:id", protectRoute, videoController.deleteVideo);

// Get watched videos for current user
router.get("/user/watched", protectRoute, videoController.getWatchedVideos);

// Mark a video as watched
router.post(
  "/:videoId/watch",
  protectRoute,
  videoController.markVideoAsWatched
);



export default router;
