import express from "express";
import cors from "cors";

import authRoutes from "./routes/authRoutes.js";
import blogRoutes from "./routes/blogRoutes.js";
import quizRoutes from "./routes/quizRoutes.js"
import { connectDb } from "./lib/db.js";

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
};

app.use(express.json());
app.use(cors(corsOptions));

app.use("/api/auth", authRoutes);
app.use("/api/blogs", blogRoutes);
api.use("/api/quizzes", quizRoutes) 

app.listen(PORT, "0.0.0.0", () => {
  console.log("Server is running on port 3000");
  connectDb();
});
