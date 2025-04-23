// backend/src/routes/newsRoutes.js
import express from "express";
import * as newsController from "../controllers/newsController.js";
import protectRoute from "../middleware/auth.middleware.js";
import upload from "../middleware/multer.js";

const router = express.Router();

// Public routes
router.get("/", newsController.getAllNews);
router.get("/:id", newsController.getNewsById);

// Protected routes (admin only)
router.post(
  "/",
  protectRoute,
  upload.single("thumbnail"),
  newsController.createNews
);

router.put(
  "/:id",
  protectRoute,
  upload.single("thumbnail"),
  newsController.updateNews
);

router.delete("/:id", protectRoute, newsController.deleteNews);

export default router;
