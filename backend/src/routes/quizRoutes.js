// routes/quizzes.js - Express route handler for quiz-related endpoints
const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Quiz = require('../models/Quiz');
const auth = require('../middleware/auth');

// GET endpoint to retrieve all finished quizzes for the authenticated user
router.get('/finished', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate('finishedQuizzes');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json({ 
      finishedQuizzes: user.finishedQuizzes,
      count: user.finishedQuizzes.length 
    });
  } catch (err) {
    console.error('Error fetching finished quizzes:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST endpoint to mark a quiz as finished by a user
router.post('/:quizId/finish', auth, async (req, res) => {
  try {
    const quizId = req.params.quizId;
    
    // Validate if quiz exists
    const quiz = await Quiz.findById(quizId);
    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found' });
    }
    
    // Update user document to add quiz to finishedQuizzes if not already there
    const user = await User.findById(req.user.id);
    
    // Check if quiz is already marked as finished
    if (user.finishedQuizzes.includes(quizId)) {
      return res.json({ message: 'Quiz already marked as finished' });
    }
    
    // Add quiz to finishedQuizzes array
    user.finishedQuizzes.push(quizId);
    await user.save();
    
    res.json({ 
      message: 'Quiz marked as finished successfully',
      finishedCount: user.finishedQuizzes.length
    });
  } catch (err) {
    console.error('Error marking quiz as finished:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router