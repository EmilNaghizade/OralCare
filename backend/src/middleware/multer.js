// backend/src/middleware/multer.js
import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, "../uploads");
const videoDir = path.join(uploadsDir, "videos");
const thumbnailDir = path.join(uploadsDir, "thumbnails");
const productDir = path.join(uploadsDir, "products");

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
if (!fs.existsSync(videoDir)) {
  fs.mkdirSync(videoDir, { recursive: true });
}
if (!fs.existsSync(thumbnailDir)) {
  fs.mkdirSync(thumbnailDir, { recursive: true });
}
if (!fs.existsSync(productDir)) {
  fs.mkdirSync(productDir, { recursive: true });
}

// Configure storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    if (file.fieldname === "video") {
      cb(null, videoDir);
    } else if (file.fieldname === "thumbnail") {
      cb(null, thumbnailDir);
    } else if (file.fieldname === "image") {
      cb(null, productDir);
    } else {
      cb(null, uploadsDir);
    }
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + "-" + uniqueSuffix + ext);
  },
});

// File filter
const fileFilter = (req, file, cb) => {
  if (file.fieldname === "video") {
    if (file.mimetype.startsWith("video/")) {
      cb(null, true);
    } else {
      cb(new Error("Only video files are allowed for video field"), false);
    }
  } else if (file.fieldname === "thumbnail" || file.fieldname === "image") {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed for image fields"), false);
    }
  } else {
    cb(null, true);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 1024 * 1024 * 100, // 100MB limit
  },
});

export default upload;
