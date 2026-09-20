const jwt = require('jsonwebtoken');
const config = require('../config/config');
const User = require('../models/User');

const authenticateUser = async (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized to access this route, token missing'
    });
  }

  try {
    const decoded = jwt.verify(token, config.JWT_SECRET);
    let user = await User.findById(decoded.id).populate('team');
    
    // In development or after server restart, fall back to email or single tournament admin
    if (!user) {
      if (decoded.email) {
        user = await User.findOne({ email: decoded.email.toLowerCase() }).populate('team');
      }
      if (!user) {
        user = await User.findOne({ email: 'prashanth9392557522@gmail.com' }).populate('team');
      }
    }

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User no longer exists'
      });
    }
    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      message: 'Token verification failed or expired'
    });
  }
};

const optionalAuth = async (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next();
  }

  try {
    const decoded = jwt.verify(token, config.JWT_SECRET);
    let user = await User.findById(decoded.id).populate('team');
    if (!user && decoded.email) {
      user = await User.findOne({ email: decoded.email.toLowerCase() }).populate('team');
    }
    if (!user) {
      user = await User.findOne({ email: 'prashanth9392557522@gmail.com' }).populate('team');
    }
    if (user) {
      req.user = user;
    }
  } catch (err) {
    // ignore invalid token for optional auth
  }
  next();
};

const requireAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'ADMIN') {
    return res.status(403).json({
      success: false,
      message: 'Access denied: Admin privileges required'
    });
  }
  next();
};

const requireTeamOwner = (req, res, next) => {
  if (!req.user || (req.user.role !== 'TEAM_OWNER' && req.user.role !== 'ADMIN')) {
    return res.status(403).json({
      success: false,
      message: 'Access denied: Team Owner privileges required'
    });
  }
  next();
};

module.exports = {
  authenticateUser,
  optionalAuth,
  requireAdmin,
  requireTeamOwner
};

