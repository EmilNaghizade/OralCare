import express from "express";
import Product from "../models/Product.js";
import protectRoute from "../middleware/auth.middleware.js";
import cloudinary from "../lib/cloudinary.js";
import { validateProduct } from "../middleware/validators.js";

const router = express.Router();

// Get all products with pagination and filtering
router.get("/", async (req, res) => {
  try {
    const products = await Product.find(query);

    const total = await Product.countDocuments(query);

    res.json({
      products,
      totalProducts: total,
    });
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Create product (admin only)
router.post("/", protectRoute, validateProduct, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res
        .status(403)
        .json({ error: "Not authorized to create products" });
    }

    const { name, description, category, price, stock, photo } = req.body;

    // Upload image to cloudinary
    let photoUrl = "";
    if (photo) {
      const uploadResponse = await cloudinary.uploader.upload(photo);
      photoUrl = uploadResponse.secure_url;
    }

    const product = new Product({
      name,
      description,
      category,
      price,
      stock,
      photo: photoUrl,
    });

    await product.save();
    res.status(201).json(product);
  } catch (error) {
    console.error("Error creating product:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Update product (admin only)
router.put("/:id", protectRoute, validateProduct, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res
        .status(403)
        .json({ error: "Not authorized to update products" });
    }

    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    const { name, description, category, price, stock, photo } = req.body;

    // Handle photo update
    if (photo && photo !== product.photo) {
      // Delete old photo from cloudinary if exists
      if (product.photo) {
        const publicId = product.photo.match(/upload\/(.*?)(\/|\.)/)[1];
        await cloudinary.uploader.destroy(publicId);
      }

      // Upload new photo
      const uploadResponse = await cloudinary.uploader.upload(photo);
      product.photo = uploadResponse.secure_url;
    }

    // Update other fields
    product.name = name || product.name;
    product.description = description || product.description;
    product.category = category || product.category;
    product.price = price || product.price;
    product.stock = stock || product.stock;

    await product.save();
    res.json(product);
  } catch (error) {
    if (error.kind === "ObjectId") {
      return res.status(400).json({ error: "Invalid product ID" });
    }
    console.error("Error updating product:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Delete product (admin only)
router.delete("/:id", protectRoute, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res
        .status(403)
        .json({ error: "Not authorized to delete products" });
    }

    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    // Delete photo from cloudinary if exists
    if (product.photo) {
      const publicId = product.photo.match(/upload\/(.*?)(\/|\.)/)[1];
      await cloudinary.uploader.destroy(publicId);
    }

    await product.remove();
    res.json({ message: "Product removed successfully" });
  } catch (error) {
    if (error.kind === "ObjectId") {
      return res.status(400).json({ error: "Invalid product ID" });
    }
    console.error("Error deleting product:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
