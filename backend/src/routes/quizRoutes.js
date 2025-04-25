// routes/quizzes.js - Express route handler for quiz-related endpoints
import express from "express";
import User from "../models/User.js";
import protectRoute from "../middleware/auth.middleware.js";
import * as quizController from "../controllers/quizController.js";

const router = express.Router();

// GET endpoint to retrieve all finished quizzes for the authenticated user
router.get("/finished", protectRoute, quizController.getFinishedQuizzes);

// POST endpoint to mark a quiz as finished by a user
router.post(
  "/:quizId/finish",
  protectRoute,
  async (req, res) => quizController.markQuizAsFinished
);

export default router;
