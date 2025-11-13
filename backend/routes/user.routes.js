// backend/routes/user.routes.js
const express = require('express');
const { verifyToken } = require('../middleware/auth.middleware');
const userController = require('../controllers/user.controller');

const router = express.Router();

// All routes require authentication
router.use(verifyToken);

// Get user profile
router.get('/profile', userController.getProfile);

// Update user profile
router.put('/profile', userController.updateProfile);

// Get user skills
router.get('/skills', userController.getSkills);

// Add skill
router.post('/skills', userController.addSkill);

module.exports = router;
