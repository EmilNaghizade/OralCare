// models/Quiz.js
import mongoose from "mongoose";

const QuizSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String
  },
  questions: [
    {
      question: {
        type: String,
        required: true
      },
      options: [String],
      correctAnswer: {
        type: Number, // Index of the correct option
        required: true
      }
    }
  ],
  category: {
    type: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Quiz = mongoose.model("Quiz", QuizSchema);

export default Quiz;

