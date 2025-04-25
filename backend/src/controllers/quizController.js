import express from "express";
import Quiz from "../models/Quiz.js";
import User from "../models/User.js";
import protectRoute from "../middleware/auth.middleware.js";

const router = express.Router();

export const getFinishedQuizzes = async (req, res) => {
  try {
    // Get the user without attempting to populate
    const user = await User.findById(req.user.id).select(
      "name email watchedVideos finishedQuizzes role"
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      finishedQuizIds: user.finishedQuizzes || [],
      count: (user.finishedQuizzes || []).length,
    });
  } catch (err) {
    console.error("Error fetching finished quizzes:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};

export const markQuizAsFinished = async (req, res) => {
  try {
    // Get the user without attempting to populate
    const user = await User.findById(req.user.id).select(
      "name email watchedVideos finishedQuizzes role"
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      finishedQuizIds: user.finishedQuizzes || [],
      count: (user.finishedQuizzes || []).length,
    });
  } catch (err) {
    console.error("Error fetching finished quizzes:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};
