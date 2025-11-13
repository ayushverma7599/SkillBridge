const { Project, User, Application } = require('../models');
const { Op } = require('sequelize');

// Create Project
exports.createProject = async (req, res) => {
  try {
    const { title, description, budget, deadline, skills, category } = req.body;

    const project = await Project.create({
      title,
      description,
      budget,
      deadline,
      skills: JSON.stringify(skills),
      category,
      freelancerId: req.user.id,
      status: 'open'
    });

    res.status(201).json(project);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get All Projects
exports.getAllProjects = async (req, res) => {
  try {
    const { category, minBudget, maxBudget, search } = req.query;
    let where = { status: 'open' };

    if (category) where.category = category;
    if (minBudget) where.budget = { [Op.gte]: minBudget };
    if (maxBudget) where.budget = { [Op.lte]: maxBudget };
    if (search) where.title = { [Op.iLike]: `%${search}%` };

    const projects = await Project.findAll({ where, include: 'freelancer' });
    res.json(projects);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get Project Details
exports.getProjectById = async (req, res) => {
  try {
    const project = await Project.findByPk(req.params.id, {
      include: ['freelancer', 'milestones', 'applications']
    });
    if (!project) return res.status(404).json({ message: 'Project not found' });
    res.json(project);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Apply for Project
exports.applyProject = async (req, res) => {
  try {
    const { projectId } = req.body;
    
    let application = await Application.findOne({
      where: { projectId, studentId: req.user.id }
    });
    
    if (application) return res.status(400).json({ message: 'Already applied' });

    application = await Application.create({
      projectId,
      studentId: req.user.id,
      status: 'pending',
      appliedAt: new Date()
    });

    res.status(201).json(application);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
