// backend/middleware/authMiddleware.js

const jwt = require('jsonwebtoken');
const { User } = require('../models');

module.exports = async function (req, res, next) {
  const header = req.headers['authorization'];

  // Check for Bearer token
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'No token provided. Authorization denied.' });
  }

  const token = header.split(' ')[1];
  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;

    // Optional: fetch user from DB and attach to req
    const user = await User.findByPk(decoded.id);
    if (!user) return res.status(401).json({ message: 'User does not exist.' });

    req.user = user;
    next();
  } catch (err) {
    res.status(401).json({ message: 'Invalid or expired token.' });
  }
};
