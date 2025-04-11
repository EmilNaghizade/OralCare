// models/Quiz.js
const mongoose = require('mongoose');

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

module.exports = mongoose.model('Quiz', QuizSchema);