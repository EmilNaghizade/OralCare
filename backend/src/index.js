import express from "express";
import cors from "cors";

import authRoutes from "./routes/authRoutes.js";
import blogRoutes from "./routes/blogRoutes.js";
import { connectDb } from "./lib/db.js";

const app = express();
const PORT= process.env.PORT || 8080;


app.use(express.json());
app.use(cors());

app.use("/api/auth",authRoutes)
app.use("api/blogs",blogRoutes)

app.listen(PORT,"0.0.0.0", () => {
  console.log("Server is running on port 3000");
  connectDb();
});
