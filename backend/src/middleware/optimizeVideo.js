// utils/optimizeVideo.js
import ffmpeg from "fluent-ffmpeg";
import path from "path";
import fs from "fs";

export const optimizeVideo = (inputPath) => {
  return new Promise((resolve, reject) => {
    const fileName = path.basename(inputPath);
    const outputDir = path.join("uploads", "optimized");
    const outputPath = path.join(outputDir, fileName);

    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    ffmpeg(inputPath)
      .outputOptions(["-movflags faststart", "-preset veryfast", "-crf 28"])
      .on("end", () => {
        console.log(`✅ Video optimized: ${outputPath}`);
        resolve(outputPath);
      })
      .on("error", (err) => {
        console.error("❌ Optimization error:", err.message);
        reject(err);
      })
      .save(outputPath);
  });
};
