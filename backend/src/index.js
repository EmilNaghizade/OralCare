import express from "express";
import cors from "cors";
import path from "path";
import compression from 'compression';
import { fileURLToPath } from "url";

import authRoutes from "./routes/authRoutes.js";
import quizRoutes from "./routes/quizRoutes.js";
import videoRoutes from "./routes/videoRoutes.js";
import profileRoutes from "./routes/profileRoutes.js";
import { connectDb } from "./lib/db.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 8080;
const allowedOrigins = [
  "http://localhost:19006",
  "http://localhost:8080",
  "https://oralcare.fly.dev",
];

const corsOptions = {
  origin: function (origin, callback) {
    if (allowedOrigins.indexOf(origin) !== -1 || !origin) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"], // İzin verilen HTTP metotları
  allowedHeaders: ["Content-Type", "Authorization"], // İzin verilen başlıklar
  credentials: true, // Çerezlerin gönderilmesine izin ver
  exposedHeaders: ["Content-Disposition"],
};

app.use(cors(corsOptions));
app.use(express.urlencoded({ extended: true, limit: "100mb" }));
app.use(express.json({ limit: "100mb" }));
app.use(compression());

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use("/api/auth", authRoutes);
app.use("/api/quizzes", quizRoutes);
app.use("/api/videos", videoRoutes);
app.use("/api/profile", profileRoutes);

app.listen(PORT, "0.0.0.0", () => {
  console.log("Server is running on port 3000");
  connectDb();
});
