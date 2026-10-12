// models/Quiz.js
import mongoose from "mongoose";

const QuizSchema = new mongoose.Schema({
  title: {
    en: {
      type: String,
      required: true,
    },
    ru: {
      type: String,
      required: true,
    },
  },
  description: {
    en: {
      type: String,
      required: true,
    },
    ru: {
      type: String,
      required: true,
    },
  },
  questions: [
    {
      question: {
        en: {
          type: String,
          required: true,
        },
        ru: {
          type: String,
          required: true,
        },
      },
      options: {
        en: [{ type: String, required: true }],
        ru: [{ type: String, required: true }],
      },
      correctAnswer: {
        type: Number, // Index of the correct option
        required: true,
      },
    },
  ],
  colorScheme: {
    type: String,
    enum: ["green", "purple", "blue", "orange"],
    default: "green",
  },
  category: {
    en: {
      type: String,
      required: true,
    },
    ru: {
      type: String,
      required: true,
    },
  },
  time: {
    type: Number,
    default: 2, // Time in minutes
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  isPublished: {
    type: Boolean,
    default: true,
  },
});

const Quiz = mongoose.model("Quiz", QuizSchema);

export default Quiz;
