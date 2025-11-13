// backend/routes/project.routes.js
const express = require('express');
const { verifyToken } = require('../middleware/auth.middleware');
const projectController = require('../controllers/project.controller');

const router = express.Router();

// Public routes
router.get('/', projectController.getAllProjects);
router.get('/:projectId', projectController.getProjectById);

// Protected routes
router.use(verifyToken);
router.post('/', projectController.createProject);
router.put('/:projectId', projectController.updateProject);
router.delete('/:projectId', projectController.deleteProject);

module.exports = router;
