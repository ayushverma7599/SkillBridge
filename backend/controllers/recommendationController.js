
const { Project, User } = require('../models');
const aiMatchingService = require('../services/aiMatchingService');

exports.getRecommendations = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id);
    
    const allProjects = await Project.findAll({
      where: { status: 'open' },
      include: [{
        model: User,
        as: 'freelancer',
        attributes: ['id', 'fullName', 'avatar']
      }]
    });

    const recommendations = await aiMatchingService.getRecommendedProjects(user, allProjects);

    res.json({
      recommendations: recommendations.slice(0, 10),
      totalMatches: recommendations.length
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
