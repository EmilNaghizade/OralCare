import User from "../models/User.js";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Upload profile image base64
export const uploadPhotoBase64 = async (req, res) => {
  try {
    // Expect JSON with property "image" containing the base64-encoded data.
    const { image, filename } = req.body;
    if (!image) {
      return res
        .status(400)
        .json({ success: false, message: "No image data provided" });
    }

    // Determine MIME type and clean the base64 string if it has a data URL prefix.
    let base64Data = image;
    let mimeType = "image/jpeg"; // default MIME type

    const dataUrlMatch = image.match(/^data:(.+);base64,(.*)$/);
    if (dataUrlMatch) {
      mimeType = dataUrlMatch[1];
      base64Data = dataUrlMatch[2];
    }

    // Generate a unique filename if not provided.
    const ext = mimeType.split("/")[1] || "jpg";
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const userId = req.user.id;
    const finalFilename = filename
      ? filename
      : `user-${userId}-${uniqueSuffix}.${ext}`;

    // Determine the file destination: preserve the upload directory.
    const fileDestDir = path.join(__dirname, "../uploads/profile-images");
    if (!fs.existsSync(fileDestDir)) {
      fs.mkdirSync(fileDestDir, { recursive: true });
    }
    const filePath = path.join(fileDestDir, finalFilename);

    // Convert base64 data to a Buffer and write the file to disk.
    const buffer = Buffer.from(base64Data, "base64");
    fs.writeFile(filePath, buffer, async (err) => {
      if (err) {
        console.error("Error writing file:", err);
        return res
          .status(500)
          .json({ success: false, message: "Error saving image" });
      }

      // Construct the accessible URL for the uploaded image.
      const fileUrl = `/uploads/profile-images/${finalFilename}`;

      // Update the user's record with the file URL and base64 image.
      const updatedUser = await User.findByIdAndUpdate(
        req.user.id,
        { profileImage: fileUrl, profileImageBase64: image },
        { new: true }
      );
      if (!updatedUser) {
        return res
          .status(404)
          .json({ success: false, message: "User not found" });
      }

      return res.status(200).json({
        success: true,
        message: "Profile image uploaded successfully",
        profileImageUrl: fileUrl,
        profileImageBase64: updatedUser.profileImageBase64,
      });
    });
  } catch (error) {
    console.error("Error in /upload-photo-base64-json:", error);
    res.status(500).json({
      success: false,
      message: "Failed to upload profile image",
    });
  }
};

// Delete profile image
export const deleteProfilePhoto = async (req, res) => {
  try {
    // Get the full user document
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (user.profileImage) {
      // Attempt to delete the file from the filesystem
      const relativePath = user.profileImage;
      const filePath = path.join(__dirname, "../..", relativePath);

      try {
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
          console.log("File deleted successfully from path:", filePath);
        } else {
          console.log("File not found at path:", filePath);
          // Continue even if the file doesn't exist
        }
      } catch (fsError) {
        console.error("Error deleting physical file:", fsError);
        // Continue with database update even if file deletion fails
      }

      // Update the database record - clear both fields
      await User.findByIdAndUpdate(req.user.id, {
        profileImage: "",
        profileImageBase64: "",
      });

      console.log(`User ${req.user.id} profile image cleared in database`);
    } else {
      console.log(`User ${req.user.id} had no profile image to delete`);
    }

    res.status(200).json({
      success: true,
      message: "Profile image deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting profile image:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete profile image",
    });
  }
};

// Get user profile
export const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select(
      "name email profileImage role"
    );
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }
    res.status(200).json({ success: true, user });
  } catch (error) {
    console.error("Error fetching user profile:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch user profile",
    });
  }
};

// Debug endpoint to check if the image exists
export const checkImage = async (req, res) => {
  try {
    const filePath = path.join(
      __dirname,
      "../../src/uploads/profile-images",
      req.params.filename
    );
    const fileExists = fs.existsSync(filePath);
    let stats = null;
    if (fileExists) {
      stats = fs.statSync(filePath);
    }
    res.json({
      filename: req.params.filename,
      exists: fileExists,
      filePath: filePath,
      stats: stats
        ? {
            size: stats.size,
            created: stats.birthtime,
            modified: stats.mtime,
            permissions: stats.mode.toString(8),
          }
        : null,
      url: `/uploads/profile-images/${req.params.filename}`,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
