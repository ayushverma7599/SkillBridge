// backend/routes/auth.js

const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Register route
router.post('/register', authController.register);

// Login route
router.post('/login', authController.login);

// Current user route (protected)
const authMiddleware = require('../middleware/authMiddleware');
router.get('/me', authMiddleware, authController.getCurrentUser);

module.exports = router;
