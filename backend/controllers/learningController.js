// backend/controllers/learningController.js
const gapDetector = require('../services/gapDetectorService');

exports.getSubjects = async (req, res) => {
  try {
    const subjects = await gapDetector.getSubjects();
    res.json({ subjects });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getQuiz = async (req, res) => {
  try {
    const { subject } = req.query;
    if (!subject) return res.status(400).json({ message: 'subject query param is required' });
    const quiz = await gapDetector.getDiagnosticQuiz(subject);
    res.json(quiz);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.submitAttempt = async (req, res) => {
  try {
    const { subject, answers } = req.body;
    if (!subject) return res.status(400).json({ message: 'subject is required' });

    const result = await gapDetector.submitAttempt({ userId: req.user.id, subject, answers });
    res.status(201).json(result);
  } catch (error) {
    res.status(error.statusCode || 500).json({ message: error.message });
  }
};

exports.getStudyPlan = async (req, res) => {
  try {
    const { subject } = req.query;
    if (!subject) return res.status(400).json({ message: 'subject query param is required' });
    const plan = await gapDetector.getStudyPlan(req.user.id, subject);
    res.json(plan);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getAttemptHistory = async (req, res) => {
  try {
    const history = await gapDetector.getAttemptHistory(req.user.id, req.query.subject);
    res.json(history);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
