const Room = require('../models/Room');
const Team = require('../models/Team');
const Auction = require('../models/Auction');
const auctionEngine = require('../services/auctionEngine');

// Generate random 6-character room code (e.g., IPL-7821)
const generateRoomCode = () => {
  const digits = Math.floor(1000 + Math.random() * 9000);
  return `IPL-${digits}`;
};

// @desc Create a new auction room
// @route POST /api/rooms
// @access Public
exports.createRoom = async (req, res, next) => {
  try {
    let { name, roomCode, hostName, hostTeamId, isPrivate, initialPurse, timerSeconds } = req.body;

    if (!roomCode || roomCode.trim() === '') {
      roomCode = generateRoomCode();
    } else {
      roomCode = roomCode.trim().toUpperCase();
    }

    // Check if room code already exists
    const existing = await Room.findOne({ roomCode });
    if (existing) {
      roomCode = generateRoomCode();
    }

    const hostMember = {
      name: hostName || 'Room Host',
      role: 'HOST',
      team: hostTeamId || null,
      joinedAt: new Date()
    };

    const room = await Room.create({
      roomCode,
      name: name || `${hostName || 'IPL'}'s Auction Room`,
      hostName: hostName || 'Room Host',
      hostTeam: hostTeamId || null,
      isPrivate: isPrivate !== false,
      status: 'LOBBY',
      rules: {
        initialPurse: Number(initialPurse) || 1200000000,
        timerSeconds: Number(timerSeconds) || 15,
        maxTeams: 10
      },
      members: [hostMember]
    });

    const populatedRoom = await Room.findById(room._id)
      .populate('hostTeam', 'name shortName logo primaryColor remainingPurse')
      .populate('members.team', 'name shortName logo primaryColor remainingPurse');

    res.status(201).json({
      success: true,
      data: populatedRoom,
      message: `Auction Room ${roomCode} created successfully!`
    });
  } catch (err) {
    next(err);
  }
};

// @desc Get room details by code
// @route GET /api/rooms/:roomCode
// @access Public
exports.getRoomByCode = async (req, res, next) => {
  try {
    const roomCode = req.params.roomCode.toUpperCase().trim();
    const room = await Room.findOne({ roomCode })
      .populate('hostTeam', 'name shortName logo primaryColor remainingPurse')
      .populate('members.team', 'name shortName logo primaryColor remainingPurse');

    if (!room) {
      return res.status(404).json({
        success: false,
        message: `Auction room "${roomCode}" not found. Please verify the code.`
      });
    }

    res.status(200).json({
      success: true,
      data: room
    });
  } catch (err) {
    next(err);
  }
};

// @desc Join an existing room
// @route POST /api/rooms/:roomCode/join
// @access Public
exports.joinRoom = async (req, res, next) => {
  try {
    const roomCode = req.params.roomCode.toUpperCase().trim();
    const { name, teamId } = req.body;

    const room = await Room.findOne({ roomCode });
    if (!room) {
      return res.status(404).json({
        success: false,
        message: `Room "${roomCode}" not found`
      });
    }

    // Check if team is already claimed by someone else in this room
    if (teamId) {
      const alreadyClaimed = room.members.find(
        (m) => m.team && m.team.toString() === teamId.toString()
      );
      if (alreadyClaimed && alreadyClaimed.name !== name) {
        return res.status(400).json({
          success: false,
          message: 'That franchise is already claimed by another participant in this room.'
        });
      }
    }

    // Check if member with this name is already in room
    let member = room.members.find((m) => m.name.toLowerCase() === (name || '').toLowerCase());
    if (member) {
      if (teamId) member.team = teamId;
    } else {
      room.members.push({
        name: name || `Player ${room.members.length + 1}`,
        role: 'MEMBER',
        team: teamId || null,
        joinedAt: new Date()
      });
    }

    await room.save();

    const populated = await Room.findById(room._id)
      .populate('hostTeam', 'name shortName logo primaryColor remainingPurse')
      .populate('members.team', 'name shortName logo primaryColor remainingPurse');

    res.status(200).json({
      success: true,
      data: populated,
      message: `Joined room ${roomCode} successfully!`
    });
  } catch (err) {
    next(err);
  }
};

// @desc Claim or switch team in room
// @route POST /api/rooms/:roomCode/claim-team
// @access Public
exports.claimTeam = async (req, res, next) => {
  try {
    const roomCode = req.params.roomCode.toUpperCase().trim();
    const { name, teamId } = req.body;

    const room = await Room.findOne({ roomCode });
    if (!room) {
      return res.status(404).json({ success: false, message: 'Room not found' });
    }

    // Check if team is taken
    if (teamId) {
      const taken = room.members.find(
        (m) => m.team && m.team.toString() === teamId.toString() && m.name.toLowerCase() !== name.toLowerCase()
      );
      if (taken) {
        return res.status(400).json({
          success: false,
          message: 'This franchise is already selected by another player.'
        });
      }
    }

    const member = room.members.find((m) => m.name.toLowerCase() === name.toLowerCase());
    if (!member) {
      room.members.push({
        name,
        role: 'MEMBER',
        team: teamId || null,
        joinedAt: new Date()
      });
    } else {
      member.team = teamId || null;
    }

    await room.save();

    const populated = await Room.findById(room._id)
      .populate('hostTeam', 'name shortName logo primaryColor remainingPurse')
      .populate('members.team', 'name shortName logo primaryColor remainingPurse');

    res.status(200).json({
      success: true,
      data: populated
    });
  } catch (err) {
    next(err);
  }
};

// @desc Get all public rooms
// @route GET /api/rooms
// @access Public
exports.getPublicRooms = async (req, res, next) => {
  try {
    const rooms = await Room.find({ isPrivate: false, status: { $ne: 'FINISHED' } })
      .sort({ createdAt: -1 })
      .limit(10)
      .populate('hostTeam', 'name shortName logo primaryColor')
      .populate('members.team', 'name shortName logo primaryColor');

    res.status(200).json({
      success: true,
      count: rooms.length,
      data: rooms
    });
  } catch (err) {
    next(err);
  }
};

// @desc Host starts the auction for this room
// @route POST /api/rooms/:roomCode/start
// @access Public
exports.startRoomAuction = async (req, res, next) => {
  try {
    const roomCode = req.params.roomCode.toUpperCase().trim();
    const room = await Room.findOne({ roomCode });
    if (!room) {
      return res.status(404).json({ success: false, message: 'Room not found' });
    }

    room.status = 'LIVE';
    await room.save();

    res.status(200).json({
      success: true,
      data: room,
      message: 'Auction started for this room!'
    });
  } catch (err) {
    next(err);
  }
};
