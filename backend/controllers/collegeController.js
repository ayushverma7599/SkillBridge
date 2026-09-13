// backend/controllers/collegeController.js
const { College } = require('../models');

// Public list of verified colleges — used by the registration screen so
// students can see which campuses are already recognised.
exports.listColleges = async (req, res) => {
  try {
    const colleges = await College.findAll({
      attributes: ['id', 'name', 'domain', 'city'],
      order: [['name', 'ASC']],
    });
    res.json(colleges);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
