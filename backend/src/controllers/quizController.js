import Quiz from "../models/Quiz.js";
import User from "../models/User.js";
import mongoose from "mongoose";
import { createContentNotification } from "./notificationController.js";

// Get all quizzes with pagination and filtering
export const getAllQuizzes = async (req, res) => {
  try {
    // 1) Parse pagination + locale
    const page = parseInt(req.query.page || "1", 10);
    const limit = parseInt(req.query.limit || "10", 10);
    const skip = (page - 1) * limit;

    const language =
      req.query.lang ||
      req.headers["accept-language"]?.split(",")[0].substring(0, 2) ||
      "en";

    // 2) BUILD FILTER *before* you use it
    const filter = {};
    if (req.query.category) filter.category = req.query.category;
    if (req.query.colorScheme) filter.colorScheme = req.query.colorScheme;
    if (!req.user || req.user.role !== "admin") {
      filter.isPublished = true;
    }

    // 3) Now you can safely count & aggregate
    const totalQuizzes = await Quiz.countDocuments(filter);
    const agg = await Quiz.aggregate([
      { $match: filter },
      { $project: { num: { $size: "$questions" } } },
      { $group: { _id: null, totalQuestions: { $sum: "$num" } } },
    ]);
    const totalQuestions = agg[0]?.totalQuestions || 0;

    // 4) Fetch the paginated quizzes
    const quizzes = await Quiz.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    // 5) Transform for i18n
    const transformQuizzes = quizzes.map((quiz) => ({
      ...quiz.toObject(),
      title: quiz.title[language] || quiz.title.en,
      description: quiz.description[language] || quiz.description.en,
      category: quiz.category[language] || quiz.category.en,
      titleTranslations: quiz.title,
      descriptionTranslations: quiz.description,
      categoryTranslation: quiz.category,
    }));

    // 6) Return everything
    res.json({
      quizzes: transformQuizzes,
      totalQuizzes,
      totalQuestions,
      currentPage: page,
      totalPages: Math.ceil(totalQuizzes / limit),
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

    const language =
      req.query.lang ||
      req.headers["accept-language"]?.split(",")[0].substring(0, 2) ||
      "en";

    const transformedQuiz = {
      ...quiz.toObject(),
      title: quiz.title[language] || quiz.title.en,
      description: quiz.description[language] || quiz.description.en,
      category: quiz.category[language] || quiz.category.en,
      titleTranslations: quiz.title,
      descriptionTranslations: quiz.description,
      categoryTranslation: quiz.category,
    };

    res.json(transformedQuiz);
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

    let parsedTitle = title;
    let parsedDescription = description;
    let parsedCategory = category;

    // Validate required fields
    if (typeof title === "string") {
      try {
        parsedTitle = JSON.parse(title);
      } catch (e) {
        parsedTitle = { en: title, ru: title };
      }
    }

    if (typeof description === "string") {
      try {
        parsedDescription = JSON.parse(description);
      } catch (e) {
        parsedDescription = { en: description, ru: description };
      }
    }

    if (typeof category === "string") {
      try {
        parsedCategory = JSON.parse(category);
      } catch (e) {
        parsedCategory = { en: category, ru: category };
      }
    }

    // Validate that we have both language versions
    if (
      !parsedTitle.en ||
      !parsedTitle.ru ||
      !parsedDescription.en ||
      !parsedDescription.ru ||
      !parsedCategory.en ||
      !parsedCategory.ru
    ) {
      return res.status(400).json({
        error:
          "Title, description and category must be provided in both English and Russian",
      });
    }

    // Create a new quiz
    const quiz = new Quiz({
      title: parsedTitle,
      description: parsedDescription,
      category: parsedCategory,
      colorScheme: colorScheme || "green",
      isPublished: isPublished === undefined ? true : isPublished,
      questions: questions || [],
      time: time || 2, // Default time is 120 seconds
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

    let parsedTitle = title;
    let parsedDescription = description;
    let parsedCategory = category;

    if (typeof title === "string") {
      try {
        parsedTitle = JSON.parse(title);
      } catch (e) {
        parsedTitle = {
          ...article.title,
          en: title,
        };
      }
    }

    if (typeof description === "string") {
      try {
        parsedDescription = JSON.parse(description);
      } catch (e) {
        parsedDescription = {
          ...article.description,
          en: description,
        };
      }
    }

    if (typeof category === "string") {
      try {
        parsedCategory = JSON.parse(category);
      } catch (e) {
        parsedCategory = {
          ...article.category,
          en: category,
        };
      }
    }
    // Update basic fields
    if (parsedTitle) {
      if (!parsedTitle.en || !parsedTitle.ru) {
        return res.status(400).json({
          error: "Title must be provided in both English and Russian",
        });
      }
      quiz.title = parsedTitle;
    }

    if (parsedDescription) {
      if (!parsedDescription.en || !parsedDescription.ru) {
        return res.status(400).json({
          error: "Description must be provided in both English and Russian",
        });
      }
      quiz.description = parsedDescription;
    }

    if (parsedCategory) {
      if (!parsedCategory.en || !parsedCategory.ru) {
        return res.status(400).json({
          error: "Category must be provided in both English and Russian",
        });
      }
      quiz.category = parsedCategory;
    }
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

    if (typeof question === "string") question = JSON.parse(question);
    if (typeof options === "string") options = JSON.parse(options);

    // Validate correctAnswer is a valid index
    if (
      !question?.en ||
      !question?.ru ||
      !Array.isArray(options.en) ||
      !Array.isArray(options.ru) ||
      options.en.length < 2 ||
      options.ru.length < 2 ||
      correctAnswer === undefined
    ) {
      return res.status(400).json({
        error:
          "question ve options hem en hem ru olmalı, her dilde en az 2 seçenek içermeli ve correctAnswer belirtmeli",
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
    if (req.user.role !== "admin") {
      return res
        .status(403)
        .json({ error: "Not authorized to update questions" });
    }

    let { question, options, correctAnswer } = req.body;
    const { id: quizId, questionId } = req.params;

    const quiz = await Quiz.findById(quizId);
    if (!quiz) return res.status(404).json({ error: "Quiz not found" });

    const qIdx = quiz.questions.findIndex(
      (q) => q._id.toString() === questionId
    );
    if (qIdx === -1)
      return res.status(404).json({ error: "Question not found" });

    // 1) question güncelleme
    if (question !== undefined) {
      if (typeof question === "string") question = JSON.parse(question);
      if (!question.en || !question.ru) {
        return res.status(400).json({ error: "question hem en hem ru olmalı" });
      }
      quiz.questions[qIdx].question = question;
    }

    // 2) options güncelleme
    if (options !== undefined) {
      if (typeof options === "string") options = JSON.parse(options);
      if (
        !Array.isArray(options.en) ||
        !Array.isArray(options.ru) ||
        options.en.length < 2 ||
        options.ru.length < 2
      ) {
        return res.status(400).json({
          error: "options.en ve options.ru en az 2 seçenekli dizi olmalı",
        });
      }
      quiz.questions[qIdx].options = options;

      // eğer mevcut correctAnswer dizinin dışına çıktıysa sıfırla
      if (quiz.questions[qIdx].correctAnswer >= options.en.length) {
        quiz.questions[qIdx].correctAnswer = 0;
      }
    }

    // 3) correctAnswer güncelleme
    if (correctAnswer !== undefined) {
      const len = quiz.questions[qIdx].options.en.length;
      if (correctAnswer < 0 || correctAnswer >= len) {
        return res.status(400).json({ error: "correctAnswer geçersiz index" });
      }
      quiz.questions[qIdx].correctAnswer = correctAnswer;
    }

    await quiz.save();
    res.json(quiz.questions[qIdx]);
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
