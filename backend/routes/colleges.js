const express = require('express');
const collegeController = require('../controllers/collegeController');

const router = express.Router();

// Public — needed on the registration screen before the user is logged in.
router.get('/', collegeController.listColleges);

module.exports = router;
