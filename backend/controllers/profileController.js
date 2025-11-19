const { User } = require('../models');
const multer = require('multer');
const path = require('path');

// Multer config for avatar upload
const storage = multer.diskStorage({
  destination: './uploads/avatars/',
  filename: (req, file, cb) => {
    cb(null, `avatar_${req.user.id}_${Date.now()}${path.extname(file.originalname)}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    
    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error('Only image files are allowed'));
  }
}).single('avatar');

// Get user profile
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: { exclude: ['password'] }
    });
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update profile
exports.updateProfile = async (req, res) => {
  try {
    const { fullName, bio, skills, university, course, year } = req.body;
    
    const user = await User.findByPk(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update fields
    if (fullName) user.fullName = fullName;
    if (bio) user.bio = bio;
    if (skills) user.skills = JSON.stringify(skills);
    if (university) user.university = university;
    if (course) user.course = course;
    if (year) user.year = year;

    await user.save();

    res.json({
      message: 'Profile updated successfully',
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        bio: user.bio,
        skills: user.skills,
        university: user.university,
        course: user.course,
        year: user.year
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Upload avatar
exports.uploadAvatar = (req, res) => {
  upload(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ message: err.message });
    }

    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    try {
      const user = await User.findByPk(req.user.id);
      user.avatar = `/uploads/avatars/${req.file.filename}`;
      await user.save();

      res.json({
        message: 'Avatar uploaded successfully',
        avatar: user.avatar
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });
};

exports.upload = upload;
