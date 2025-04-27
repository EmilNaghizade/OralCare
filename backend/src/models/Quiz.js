// models/Quiz.js
import mongoose from "mongoose";

const QuizSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  questions: [
    {
      question: {
        type: String,
        required: true,
      },
      options: [String],
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
    type: String,
  },
  time: {
    type: Number,
    default: 120, // Time in seconds
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
