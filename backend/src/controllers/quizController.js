import Quiz from "../models/Quiz.js";
import User from "../models/User.js";
import mongoose from "mongoose";
import { createContentNotification } from "./notificationController.js";

// Get all quizzes with pagination and filtering
export const getAllQuizzes = async (req, res) => {
  try {
    const page = req.query.page ? parseInt(req.query.page) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit) : 10;
    const skip = (page - 1) * limit;

    // Build filter based on query parameters
    const filter = {};
    if (req.query.category) filter.category = req.query.category;
    if (req.query.colorScheme) filter.colorScheme = req.query.colorScheme;

    // Only published quizzes for regular users
    if (!req.user || req.user.role !== "admin") {
      filter.isPublished = true;
    }

    const quizzes = await Quiz.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Quiz.countDocuments(filter);

    res.json({
      quizzes,
      totalQuizzes: total,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("Error fetching quizzes:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Get a quiz by ID
export const getQuizById = async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id);

    if (!quiz) {
      return res.status(404).json({ error: "Quiz not found" });
    }

    // If quiz is not published and user is not admin, don't show it
    if (!quiz.isPublished && (!req.user || req.user.role !== "admin")) {
      return res.status(404).json({ error: "Quiz not found" });
    }

    res.json(quiz);
  } catch (error) {
    console.error("Error fetching quiz:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Create a new quiz
export const createQuiz = async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== "admin") {
      return res
        .status(403)
        .json({ error: "Not authorized to create quizzes" });
    }

    const {
      title,
      description,
      category,
      colorScheme,
      isPublished,
      questions,
      time,
    } = req.body;

    // Validate required fields
    if (!title || !description) {
      return res
        .status(400)
        .json({ error: "Title or Description is required" });
    }

    // Create a new quiz
    const quiz = new Quiz({
      title,
      description,
      category,
      colorScheme: colorScheme || "green",
      isPublished: isPublished === undefined ? true : isPublished,
      questions: questions || [],
      time: time || 120, // Default time is 120 seconds
    });

    await quiz.save();

    // Create a notification for all users
    await createContentNotification("New Quiz Available", "quiz", quiz);
    res.status(201).json(quiz);
  } catch (error) {
    console.error("Error creating quiz:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Update a quiz by ID
// Update an existing quiz (admin only)
export const updateQuiz = async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== "admin") {
      return res
        .status(403)
        .json({ error: "Not authorized to update quizzes" });
    }

    const { title, description, category, colorScheme, isPublished, time } =
      req.body;
    const quizId = req.params.id;

    // Find the existing quiz
    const quiz = await Quiz.findById(quizId);
    if (!quiz) {
      return res.status(404).json({ error: "Quiz not found" });
    }

    // Update fields
    if (title !== undefined) quiz.title = title;
    if (description !== undefined) quiz.description = description;
    if (category !== undefined) quiz.category = category;
    if (colorScheme !== undefined) quiz.colorScheme = colorScheme;
    if (isPublished !== undefined) quiz.isPublished = isPublished;
    if (time !== undefined) quiz.time = time;

    await quiz.save();
    res.json(quiz);
  } catch (error) {
    console.error("Error updating quiz:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Delete a quiz (admin only)
export const deleteQuiz = async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== "admin") {
      return res
        .status(403)
        .json({ error: "Not authorized to delete quizzes" });
    }

    const quiz = await Quiz.findById(req.params.id);
    if (!quiz) {
      return res.status(404).json({ error: "Quiz not found" });
    }

    await Quiz.findByIdAndDelete(req.params.id);

    // Also update any users who had this quiz marked as finished but finishedQuizzes is array and quizId is number
    await User.updateMany(
      { finishedQuizzes: req.params.id },
      { $pull: { finishedQuizzes: req.params.id } }
    );

    res.json({ message: "Quiz deleted successfully" });
  } catch (error) {
    console.error("Error deleting quiz:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Add a question to a quiz (admin only)
export const addQuestion = async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== "admin") {
      return res.status(403).json({ error: "Not authorized to add questions" });
    }

    const { question, options, correctAnswer } = req.body;

    // Validate required fields
    if (!question || !options || correctAnswer === undefined) {
      return res.status(400).json({
        error: "Question, options, and correctAnswer are required",
      });
    }

    // Validate options is an array
    if (!Array.isArray(options) || options.length < 2) {
      return res.status(400).json({
        error: "Options must be an array with at least 2 items",
      });
    }

    // Validate correctAnswer is a valid index
    if (correctAnswer < 0 || correctAnswer >= options.length) {
      return res.status(400).json({
        error: "correctAnswer must be a valid index in the options array",
      });
    }

    const quiz = await Quiz.findById(req.params.id);
    if (!quiz) {
      return res.status(404).json({ error: "Quiz not found" });
    }

    // Add the new question
    quiz.questions.push({
      question,
      options,
      correctAnswer,
    });

    await quiz.save();

    // Return the added question with its ID
    const addedQuestion = quiz.questions[quiz.questions.length - 1];
    res.status(201).json(addedQuestion);
  } catch (error) {
    console.error("Error adding question:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Update a question in a quiz (admin only)
export const updateQuestion = async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== "admin") {
      return res
        .status(403)
        .json({ error: "Not authorized to update questions" });
    }

    const { question, options, correctAnswer } = req.body;
    const { id: quizId, questionId } = req.params;

    // Find the quiz
    const quiz = await Quiz.findById(quizId);
    if (!quiz) {
      return res.status(404).json({ error: "Quiz not found" });
    }

    // Find the question index
    const questionIndex = quiz.questions.findIndex(
      (q) => q._id.toString() === questionId
    );

    if (questionIndex === -1) {
      return res.status(404).json({ error: "Question not found" });
    }

    // Update the question fields
    if (question !== undefined) {
      quiz.questions[questionIndex].question = question;
    }

    if (options !== undefined) {
      // Validate options
      if (!Array.isArray(options) || options.length < 2) {
        return res.status(400).json({
          error: "Options must be an array with at least 2 items",
        });
      }
      quiz.questions[questionIndex].options = options;

      // If options change, make sure correctAnswer is still valid
      if (
        correctAnswer === undefined &&
        quiz.questions[questionIndex].correctAnswer >= options.length
      ) {
        quiz.questions[questionIndex].correctAnswer = 0;
      }
    }

    if (correctAnswer !== undefined) {
      // Validate correctAnswer against current options
      const currentOptions = quiz.questions[questionIndex].options;
      if (correctAnswer < 0 || correctAnswer >= currentOptions.length) {
        return res.status(400).json({
          error: "correctAnswer must be a valid index in the options array",
        });
      }
      quiz.questions[questionIndex].correctAnswer = correctAnswer;
    }

    await quiz.save();

    // Return the updated question
    res.json(quiz.questions[questionIndex]);
  } catch (error) {
    console.error("Error updating question:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Delete a question from a quiz (admin only)
export const deleteQuestion = async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== "admin") {
      return res
        .status(403)
        .json({ error: "Not authorized to delete questions" });
    }

    const { id: quizId, questionId } = req.params;

    // Find the quiz
    const quiz = await Quiz.findById(quizId);
    if (!quiz) {
      return res.status(404).json({ error: "Quiz not found" });
    }

    // Make sure quiz has at least one question after deletion
    if (quiz.questions.length <= 1) {
      return res.status(400).json({
        error:
          "Cannot delete the last question. A quiz must have at least one question.",
      });
    }

    // Find the question and remove it
    const initialLength = quiz.questions.length;
    quiz.questions = quiz.questions.filter(
      (q) => q._id.toString() !== questionId
    );

    // If no questions were removed, the questionId was invalid
    if (quiz.questions.length === initialLength) {
      return res.status(404).json({ error: "Question not found" });
    }

    await quiz.save();
    res.json({ message: "Question deleted successfully" });
  } catch (error) {
    console.error("Error deleting question:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

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
    const quizId = req.params.quizId;

    // Get the user without attempting to populate
    const user = await User.findById(req.user.id).select(
      "name email watchedVideos finishedQuizzes role"
    );
    // Check if quiz is already marked as finished
    if (user.finishedQuizzes.includes(quizId)) {
      return res.json({ message: "Quiz already marked as finished" });
    }

    // Add quiz to finishedQuizzes array
    user.finishedQuizzes.push(quizId);
    await user.save();

    res.json({
      message: "Quiz marked as finished successfully",
      finishedCount: user.finishedQuizzes.length,
    });
  } catch (err) {
    console.error("Error fetching finished quizzes:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};
