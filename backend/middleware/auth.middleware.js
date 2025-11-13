// backend/middleware/auth.middleware.js
const { getAuth } = require('../config/firebase');

// Verify Firebase token
const verifyToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        status: 'error',
        message: 'No token provided'
      });
    }
    
    const token = authHeader.split('Bearer ')[1];
    
    // Verify token with Firebase
    const decodedToken = await getAuth().verifyIdToken(token);
    
    // Attach user info to request
    req.user = {
      uid: decodedToken.uid,
      email: decodedToken.email,
      emailVerified: decodedToken.email_verified
    };
    
    next();
  } catch (error) {
    console.error('Token verification error:', error);
    return res.status(401).json({
      status: 'error',
      message: 'Invalid or expired token'
    });
  }
};

// Check user role
const checkRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !req.user.role) {
      return res.status(403).json({
        status: 'error',
        message: 'Access denied: No role assigned'
      });
    }
    
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        status: 'error',
        message: 'Access denied: Insufficient permissions'
      });
    }
    
    next();
  };
};

module.exports = { verifyToken, checkRole };
