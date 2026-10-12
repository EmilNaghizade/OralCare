import Product from "../models/Product.js";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import { createContentNotification } from "./notificationController.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Get all products
export const getAllProducts = async (req, res) => {
  try {
    const page = req.query.page ? Number(req.query.page) : 1;
    const limit = req.query.limit ? Number(req.query.limit) : 10;
    const skip = (page - 1) * limit;

    // Get the preferred language from query params or headers
    const language =
      req.query.lang ||
      req.headers["accept-language"]?.split(",")[0].substring(0, 2) ||
      "en";

    const products = await Product.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    // Transform products to include only the requested language for backward compatibility
    const transformedProducts = products.map((product) => ({
      ...product.toObject(),
      name: product.name[language] || product.name.en, // Fallback to English if requested language not available
      // Include all language versions in a separate property for clients that want to handle multiple languages
      nameTranslations: product.name,
    }));

    const total = await Product.countDocuments();

    res.json({
      products: transformedProducts,
      totalProducts: total,
    });
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Create product (admin only)
export const createProduct = async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== "admin") {
      return res.status(403).json({ error: "Not authorized to add products" });
    }

    const { name, link } = req.body;

    // Validate required fields
    if (!name || !link) {
      return res
        .status(400)
        .json({ error: "Name and link are required fields" });
    }

    let parsedName = name;
    if (typeof name === "string") {
      try {
        parsedName = JSON.parse(name);
      } catch (e) {
        // If parsing fails, assume it's a simple string and use it for English
        parsedName = { en: name, ru: name };
      }
    }

    // Validate that we have both language versions
    if (!parsedName.en || !parsedName.ru) {
      return res
        .status(400)
        .json({ error: "Name must be provided in both English and Russian" });
    }

    // Check if files were uploaded
    if (!req.files || !req.files.image) {
      return res.status(400).json({ error: "Product image is required" });
    }

    // Get the image file
    const imageFile = req.files.image[0];

    // Create paths that will be accessible from the frontend
    const imageUrl = `/uploads/products/${imageFile.filename}`;

    // Create the product
    const product = new Product({
      name: parsedName,
      imageUrl,
      link,
    });

    await createContentNotification(
      "New Product Available",
      "product",
      product
    );

    await product.save();

    res.status(201).json(product);
  } catch (error) {
    console.error("Error creating product:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Get a single product
export const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }
    // Get the preferred language from query params or headers
    const language =
      req.query.lang ||
      req.headers["accept-language"]?.split(",")[0].substring(0, 2) ||
      "en";

    const transformedProduct = {
      ...product.toObject(),
      name: product.name[language] || product.name.en,
      nameTranslations: product.name,
    };

    res.json(transformedProduct);
  } catch (error) {
    console.error("Error fetching product:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Update product (admin only)
export const updateProduct = async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== "admin") {
      return res
        .status(403)
        .json({ error: "Not authorized to update products" });
    }

    const productId = req.params.id;
    const { name, link } = req.body;

    // Find the existing product
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }
    // ——— Bracket notation ile name alanlarını oku ———
    // Örn: name[en], name[ru], name[fr] vb.
    let parsedName = name;
    if (typeof name === "string") {
      try {
        parsedName = JSON.parse(name);
      } catch (e) {
        // If parsing fails, assume it's a simple string and keep existing translations
        parsedName = {
          ...product.name,
          en: name, // Update only English if it's a simple string
        };
      }
    }

    // Update the basic fields
    if (parsedName) {
      // Validate that we have both language versions
      if (!parsedName.en || !parsedName.ru) {
        return res
          .status(400)
          .json({ error: "Name must be provided in both English and Russian" });
      }
      product.name = parsedName;
    }

    product.link = link || product.link;

    // Update files if provided
    if (req.files && req.files.image) {
      // Update image file and delete old one if it exists
      try {
        const oldImagePath = path.join(__dirname, "../..", product.imageUrl);
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      } catch (err) {
        console.error("Error deleting old image file:", err);
        // Continue even if deletion fails
      }

      const imageFile = req.files.image[0];
      product.imageUrl = `/uploads/products/${imageFile.filename}`;
    }

    await product.save();
    res.json(product);
  } catch (error) {
    console.error("Error updating product:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Delete product (admin only)
export const deleteProduct = async (req, res) => {
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

    // Delete image file from the server
    try {
      const imagePath = path.join(__dirname, "../..", product.imageUrl);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    } catch (err) {
      console.error("Error deleting image file:", err);
      // Continue even if file deletion fails
    }

    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: "Product removed successfully" });
  } catch (error) {
    console.error("Error deleting product:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
