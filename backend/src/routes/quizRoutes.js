// routes/quizzes.js - Express route handler for quiz-related endpoints
import express from "express";
import protectRoute from "../middleware/auth.middleware.js";
import * as quizController from "../controllers/quizController.js";

const router = express.Router();

// GET endpoint to retrieve all finished quizzes for the authenticated user
router.get("/finished", protectRoute, quizController.getFinishedQuizzes);

// Get all quizzes
router.get("/", quizController.getAllQuizzes);

// Get quiz by ID
router.get("/:id", quizController.getQuizById);

// Create a new quiz
router.post("/", protectRoute, quizController.createQuiz);

// Update a quiz by ID
router.put("/:id", protectRoute, quizController.updateQuiz);

//Delete a quiz by ID
router.delete("/:id", protectRoute, quizController.deleteQuiz);

// Question management for a specific quiz
router.post("/:id/questions", protectRoute, quizController.addQuestion);
router.put(
  "/:id/questions/:questionId",
  protectRoute,
  quizController.updateQuestion
);
router.delete(
  "/:id/questions/:questionId",
  protectRoute,
  quizController.deleteQuestion
);

// POST endpoint to mark a quiz as finished by a user
router.post("/:quizId/finish", protectRoute, quizController.markQuizAsFinished);

export default router;
