import express from "express";
import * as articleController from "../controllers/articleController.js";
import protectRoute from "../middleware/auth.middleware.js";
import upload from "../middleware/multer.js";

const router = express.Router();

router.get("/", articleController.getAllArticles);
router.get("/:id", articleController.getArticleById);

router.post(
  "/",
  protectRoute,
  upload.single("thumbnail"),
  articleController.createArticle
);

router.put(
  "/:id",
  protectRoute,
  upload.single("thumbnail"),
  articleController.updateArticle
);

router.delete("/:id", protectRoute, articleController.deleteArticle);

export default router;
