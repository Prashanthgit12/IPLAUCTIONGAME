const Team = require('../models/Team');
const User = require('../models/User');

// @desc Get all teams
// @route GET /api/teams
// @access Public
exports.getTeams = async (req, res, next) => {
  try {
    const teams = await Team.find()
      .populate('owner', 'name email')
      .populate('players.player');

    // Format teams with computed squad stats
    const formattedTeams = teams.map((team) => {
      const squadCount = team.players.length;
      const overseasCount = team.players.filter(
        (p) => p.player && p.player.isOverseas
      ).length;
      const totalSpent = team.initialPurse - team.remainingPurse;

      return {
        _id: team._id,
        name: team.name,
        shortName: team.shortName,
        logo: team.logo,
        owner: team.owner,
        initialPurse: team.initialPurse,
        remainingPurse: team.remainingPurse,
        totalSpent,
        squadCount,
        maxSquadSize: team.maxSquadSize,
        remainingSlots: team.maxSquadSize - squadCount,
        overseasCount,
        maxOverseas: team.maxOverseas,
        primaryColor: team.primaryColor,
        secondaryColor: team.secondaryColor,
        players: team.players
      };
    });

    res.status(200).json({
      success: true,
      count: formattedTeams.length,
      data: formattedTeams
    });
  } catch (err) {
    next(err);
  }
};

// @desc Get single team by ID
// @route GET /api/teams/:id
// @access Public
exports.getTeamById = async (req, res, next) => {
  try {
    const team = await Team.findById(req.params.id)
      .populate('owner', 'name email role')
      .populate('players.player');

    if (!team) {
      return res.status(404).json({
        success: false,
        message: 'Team not found'
      });
    }

    const squad = team.players.map((item) => ({
      player: item.player,
      buyPrice: item.buyPrice,
      boughtAt: item.boughtAt
    }));

    // Categorize squad
    const categorized = {
      batters: squad.filter((s) => s.player && s.player.role === 'BATTER'),
      bowlers: squad.filter((s) => s.player && s.player.role === 'BOWLER'),
      allRounders: squad.filter((s) => s.player && s.player.role === 'ALL_ROUNDER'),
      wicketKeepers: squad.filter((s) => s.player && s.player.role === 'WICKET_KEEPER')
    };

    const squadCount = squad.length;
    const overseasCount = squad.filter((s) => s.player && s.player.isOverseas).length;
    const totalSpent = team.initialPurse - team.remainingPurse;

    res.status(200).json({
      success: true,
      data: {
        _id: team._id,
        name: team.name,
        shortName: team.shortName,
        logo: team.logo,
        owner: team.owner,
        initialPurse: team.initialPurse,
        remainingPurse: team.remainingPurse,
        totalSpent,
        maxSquadSize: team.maxSquadSize,
        squadCount,
        remainingSlots: team.maxSquadSize - squadCount,
        overseasCount,
        maxOverseas: team.maxOverseas,
        primaryColor: team.primaryColor,
        secondaryColor: team.secondaryColor,
        rtmCards: team.rtmCards ?? 2,
        rtmUsed: team.rtmUsed ?? 0,
        playingXI: team.playingXI || [],
        squad,
        categorizedSquad: categorized
      }
    });
  } catch (err) {
    next(err);
  }
};

// @desc Save Team Starting Playing XI
// @route PUT /api/teams/:id/playing-xi
// @access Private
exports.updatePlayingXI = async (req, res, next) => {
  try {
    const { playingXI } = req.body;
    const team = await Team.findById(req.params.id);
    if (!team) return res.status(404).json({ success: false, message: 'Team not found' });

    // Normalize playingXI whether sent as array of IDs or array of objects
    const formattedXI = (playingXI || []).map((item, index) => {
      if (typeof item === 'string') {
        return { player: item, position: index + 1 };
      }
      return {
        player: item.player || item._id || item,
        position: item.position || index + 1,
        isCaptain: !!item.isCaptain,
        isKeeper: !!item.isKeeper
      };
    });

    team.playingXI = formattedXI;
    await team.save();

    res.status(200).json({
      success: true,
      data: team.playingXI,
      message: 'Starting Playing XI saved successfully'
    });
  } catch (err) {
    next(err);
  }
};

// @desc Create team
// @route POST /api/teams
// @access Private (Admin)
exports.createTeam = async (req, res, next) => {
  try {
    const team = await Team.create(req.body);
    if (req.body.owner) {
      await User.findByIdAndUpdate(req.body.owner, {
        team: team._id,
        role: 'TEAM_OWNER'
      });
    }

    res.status(201).json({
      success: true,
      data: team
    });
  } catch (err) {
    next(err);
  }
};

// @desc Update team
// @route PUT /api/teams/:id
// @access Private (Admin)
exports.updateTeam = async (req, res, next) => {
  try {
    const team = await Team.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    if (!team) {
      return res.status(404).json({
        success: false,
        message: 'Team not found'
      });
    }

    if (req.body.owner) {
      await User.findByIdAndUpdate(req.body.owner, {
        team: team._id,
        role: 'TEAM_OWNER'
      });
    }

    res.status(200).json({
      success: true,
      data: team
    });
  } catch (err) {
    next(err);
  }
};

// @desc Delete team
// @route DELETE /api/teams/:id
// @access Private (Admin)
exports.deleteTeam = async (req, res, next) => {
  try {
    const team = await Team.findById(req.params.id);
    if (!team) {
      return res.status(404).json({
        success: false,
        message: 'Team not found'
      });
    }

    // Reset users attached to this team
    await User.updateMany({ team: team._id }, { team: null, role: 'VIEWER' });
    await team.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Team deleted successfully'
    });
  } catch (err) {
    next(err);
  }
};
