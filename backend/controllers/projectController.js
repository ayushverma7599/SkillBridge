const { Project, User, Application, ScheduleItem, College } = require('../models');
const { Op } = require('sequelize');
const NotificationService = require('../services/notificationService');
const { computeWorkload } = require('../services/workloadService');

// Create Project
const createProject = async (req, res) => {
  try {
    // Only verified campus accounts (matched to a known college email
    // domain at registration) can post work — this is what makes the board
    // "campus-only" rather than an open freelance marketplace.
    if (!req.user.isVerified) {
      return res.status(403).json({
        message: 'Only verified campus accounts can post projects. Register with your college email to get verified.',
      });
    }

    const { title, description, budget, deadline, skills, category, estimatedHoursPerWeek } = req.body;
    const project = await Project.create({
      title,
      description,
      budget,
      deadline,
      // `skills` is a JSON column — Sequelize serializes JS arrays into it
      // automatically. JSON.stringify()-ing here would double-encode it
      // (same class of bug as the profile controller's skills field).
      skills,
      category,
      freelancerId: req.user.id,
      collegeId: req.user.collegeId || null,
      estimatedHoursPerWeek: estimatedHoursPerWeek || null,
      status: 'open',
    });
    res.status(201).json(project);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get All Projects
const getAllProjects = async (req, res) => {
  try {
    const {
      category,
      minBudget,
      maxBudget,
      search,
      skills,
      status = 'open',
      sortBy = 'createdAt',
      order = 'DESC',
      page = 1,
      limit = 10,
    } = req.query;

    let where = {};
    // Status filter
    if (status) where.status = status;
    // Category filter
    if (category) where.category = category;
    // Budget filter
    if (minBudget || maxBudget) {
      where.budget = {};
      if (minBudget) where.budget[Op.gte] = parseFloat(minBudget);
      if (maxBudget) where.budget[Op.lte] = parseFloat(maxBudget);
    }
    // Search filter
    if (search) {
      where[Op.or] = [
        { title: { [Op.iLike]: `%${search}%` } },
        { description: { [Op.iLike]: `%${search}%` } }
      ];
    }
    // Skills filter (make sure your DB column supports Op.contains)
    if (skills) {
      const skillsArray = skills.split(',').map(s => s.trim());
      where.skills = { [Op.contains]: skillsArray };
    }

    // Pagination
    const offset = (page - 1) * limit;

    // Debug: Print the query object
    console.log('getAllProjects where:', where);

    // Try-Catch to see what's happening
    const { rows: projects, count } = await Project.findAndCountAll({
      where,
      include: [
        {
          model: User,
          as: 'freelancer',
          attributes: ['id', 'fullName', 'email', 'avatar'],
        },
        {
          model: College,
          as: 'college',
          attributes: ['id', 'name', 'city'],
        },
      ],
      order: [[sortBy, order]],
      limit: parseInt(limit),
      offset,
    });

    // Debug: Print found projects
    console.log('getAllProjects found:', projects.length, 'projects');

    res.json({
      projects,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(count / limit),
      },
    });

  } catch (error) {
    console.error('getAllProjects error:', error); // Error details for diagnosis
    // Extra debug info if available
    res.status(500).json({ message: error.message, errorDetails: error });
  }
};

// Get Project Details by ID
const getProjectById = async (req, res) => {
  try {
    const project = await Project.findByPk(req.params.id, {
      include: [
        { model: User, as: 'freelancer', attributes: ['id', 'fullName', 'email', 'avatar'] },
        { model: College, as: 'college', attributes: ['id', 'name', 'city'] },
      ],
    });
    if (!project) return res.status(404).json({ message: 'Project not found' });
    res.json(project);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get Projects Created by Current User
const getMyProjects = async (req, res) => {
  try {
    const projects = await Project.findAll({
      where: { freelancerId: req.user.id },
      include: [
        {
          model: Application,
          as: 'applications',
          include: [
            {
              model: User,
              as: 'student',
              attributes: ['id', 'fullName', 'email', 'avatar'],
            },
          ],
        },
      ],
      order: [['createdAt', 'DESC']],
    });
    res.json(projects);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get Applications Made by Current User
const getMyApplications = async (req, res) => {
  try {
    const applications = await Application.findAll({
      where: { studentId: req.user.id },
      include: [
        {
          model: Project,
          as: 'project',
          include: [
            {
              model: User,
              as: 'freelancer',
              attributes: ['id', 'fullName', 'email', 'avatar'],
            },
          ],
        },
      ],
      order: [['appliedAt', 'DESC']],
    });
    res.json(applications);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Apply for Project (with notification)
const applyProject = async (req, res) => {
  try {
    const { projectId } = req.body;
    let application = await Application.findOne({
      where: { projectId, studentId: req.user.id },
    });
    if (application) {
      return res.status(400).json({ message: 'Already applied' });
    }
    application = await Application.create({
      projectId,
      studentId: req.user.id,
      status: 'pending',
      appliedAt: new Date(),
    });

    const project = await Project.findByPk(projectId);
    const student = await User.findByPk(req.user.id);

    // Real-time notification
    const io = req.app.get('io');
    const notificationService = new NotificationService(io);
    notificationService.notifyProjectApplication(
      project.freelancerId,
      student.fullName,
      project.title
    );

    // Advisory workload check: warn (don't block) if this project would push
    // the student past what their academic schedule says is safe this week.
    let workloadWarning = null;
    if (project.estimatedHoursPerWeek) {
      const items = await ScheduleItem.findAll({ where: { userId: req.user.id } });
      const workload = computeWorkload(items, student.maxWeeklyHoursOverride);
      if (project.estimatedHoursPerWeek > workload.allowedHoursThisWeek) {
        workloadWarning = `This project expects ~${project.estimatedHoursPerWeek}h/week, but your schedule only has room for ${workload.allowedHoursThisWeek}h/week right now (${workload.status}).`;
      }
    }

    res.status(201).json({
      message: 'Application submitted successfully',
      application,
      workloadWarning,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Export saare handlers ek sath
module.exports = {
  createProject,
  getAllProjects,
  getProjectById,
  getMyProjects,
  getMyApplications,
  applyProject,
};
