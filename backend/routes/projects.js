
const express = require('express');
const projectController = require('../controllers/projectController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/', authMiddleware, projectController.createProject);
router.get('/', projectController.getAllProjects);
// NOTE: these fixed-path routes must come before the '/:id' route below,
// otherwise Express matches "my-projects" / "my-applications" as an :id
// value and Postgres rejects it as an invalid integer.
router.get('/my-projects', authMiddleware, projectController.getMyProjects);
router.get('/my-applications', authMiddleware, projectController.getMyApplications);
router.post('/apply', authMiddleware, projectController.applyProject);
router.get('/:id', projectController.getProjectById);

module.exports = router;
