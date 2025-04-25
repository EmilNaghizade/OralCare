// backend/src/routes/productRoutes.js
import express from "express";
import protectRoute from "../middleware/auth.middleware.js";
import upload from "../middleware/multer.js";
import * as productController from "../controllers/productController.js";

const router = express.Router();

// Get all products with pagination and filtering
router.get("/", productController.getAllProducts);

// Create product (admin only)
router.post(
  "/",
  protectRoute,
  upload.fields([{ name: "image", maxCount: 1 }]),
  productController.createProduct
);

// Get a single product
router.get("/:id", productController.getProductById);

// Update product (admin only)
router.put(
  "/:id",
  protectRoute,
  upload.fields([{ name: "image", maxCount: 1 }]),
  productController.updateProduct
);

// Delete product (admin only)
router.delete("/:id", protectRoute, productController.deleteProduct);

export default router;
