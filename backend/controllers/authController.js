const jwt = require('jsonwebtoken');
const config = require('../config/config');
const User = require('../models/User');
const Team = require('../models/Team');

const generateToken = (user) => {
  const payload =
    user && typeof user === 'object' && user._id
      ? { id: user._id, email: user.email, role: user.role }
      : { id: user };

  return jwt.sign(payload, config.JWT_SECRET, {
    expiresIn: config.JWT_EXPIRES_IN || '7d'
  });
};

// @desc Register user
// @route POST /api/auth/register
// @access Public
exports.register = async (req, res, next) => {
  try {
    const { name, email, password, role, teamId, newTeamName, newTeamShortName } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, email, and password'
      });
    }

    // Public registration only allows TEAM_OWNER or VIEWER.
    // Admin access is strictly reserved for Prashanth (prashanth9392557522@gmail.com).
    let userRole = 'VIEWER';
    if (role === 'TEAM_OWNER') {
      userRole = 'TEAM_OWNER';
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'An account with this email already exists'
      });
    }

    let assignedTeam = null;

    if (userRole === 'TEAM_OWNER') {
      if (teamId) {
        assignedTeam = await Team.findById(teamId);
      } else if (newTeamName && newTeamShortName) {
        assignedTeam = await Team.create({
          name: newTeamName.trim(),
          shortName: newTeamShortName.trim().toUpperCase(),
          initialPurse: config.AUCTION_DEFAULTS?.INITIAL_PURSE || 1200000000,
          remainingPurse: config.AUCTION_DEFAULTS?.INITIAL_PURSE || 1200000000
        });
      }
    }

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password,
      role: userRole,
      team: assignedTeam ? assignedTeam._id : null
    });

    if (assignedTeam) {
      assignedTeam.owner = user._id;
      await assignedTeam.save();
    }

    const token = generateToken(user);

    res.status(201).json({
      success: true,
      data: {
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          team: assignedTeam
        }
      }
    });
  } catch (err) {
    next(err);
  }
};

// @desc Login user
// @route POST /api/auth/login
// @access Public
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide an email and password'
      });
    }

    const user = await User.findOne({ email: email.toLowerCase() })
      .select('+password')
      .populate('team');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    const token = generateToken(user);

    res.status(200).json({
      success: true,
      data: {
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          team: user.team
        }
      }
    });
  } catch (err) {
    next(err);
  }
};

// @desc Get current logged in user
// @route GET /api/auth/me
// @access Private
exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).populate({
      path: 'team',
      populate: {
        path: 'players.player'
      }
    });

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (err) {
    next(err);
  }
};

// @desc Assign or claim a franchise for the current user
// @route PUT /api/auth/team
// @access Private
exports.assignTeam = async (req, res, next) => {
  try {
    const { teamId } = req.body;
    if (!teamId) {
      return res.status(400).json({ success: false, message: 'Please provide teamId' });
    }

    const team = await Team.findById(teamId);
    if (!team) {
      return res.status(404).json({ success: false, message: 'Franchise not found' });
    }

    const user = await User.findById(req.user._id);
    user.team = team._id;
    user.role = 'TEAM_OWNER';
    await user.save();

    team.owner = user._id;
    await team.save();

    const updatedUser = await User.findById(req.user._id).populate({
      path: 'team',
      populate: { path: 'players.player' }
    });

    res.status(200).json({
      success: true,
      message: `Assigned to ${team.name} successfully`,
      data: updatedUser
    });
  } catch (err) {
    next(err);
  }
};
