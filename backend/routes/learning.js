// backend/routes/learning.js — AI Learning Gap Detector
const express = require('express');
const learningController = require('../controllers/learningController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

router.use(authMiddleware);

router.get('/subjects', learningController.getSubjects);
router.get('/quiz', learningController.getQuiz);
router.post('/attempts', learningController.submitAttempt);
router.get('/attempts', learningController.getAttemptHistory);
router.get('/study-plan', learningController.getStudyPlan);

module.exports = router;
