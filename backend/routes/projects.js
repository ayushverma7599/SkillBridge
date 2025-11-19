
const express = require('express');
const projectController = require('../controllers/projectController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/', authMiddleware, projectController.createProject);
router.get('/', projectController.getAllProjects);
router.get('/:id', projectController.getProjectById);
router.get('/my-projects', authMiddleware, projectController.getMyProjects);
router.get('/my-applications', authMiddleware, projectController.getMyApplications);
router.post('/apply', authMiddleware, projectController.applyProject);

module.exports = router;
