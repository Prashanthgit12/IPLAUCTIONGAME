const AuctionResult = require('../models/AuctionResult');
const Team = require('../models/Team');
const Player = require('../models/Player');
const Bid = require('../models/Bid');

// @desc Get auction results with filters
// @route GET /api/results
// @access Public
exports.getResults = async (req, res, next) => {
  try {
    const { status, teamId, role, sort } = req.query;

    let query = {};
    if (status && status !== 'ALL') {
      query.status = status;
    }
    if (teamId && teamId !== 'ALL') {
      query.team = teamId;
    }

    let results = await AuctionResult.find(query)
      .sort({ timestamp: -1 })
      .populate({
        path: 'player',
        match: role && role !== 'ALL' ? { role } : {}
      })
      .populate('team', 'name shortName logo primaryColor');

    // Filter out null players if role filter removed them
    results = results.filter((r) => r.player !== null);

    if (sort === 'price_desc') {
      results.sort((a, b) => b.soldPrice - a.soldPrice);
    } else if (sort === 'price_asc') {
      results.sort((a, b) => a.soldPrice - b.soldPrice);
    } else if (sort === 'bids_desc') {
      results.sort((a, b) => b.numberOfBids - a.numberOfBids);
    }

    res.status(200).json({
      success: true,
      count: results.length,
      data: results
    });
  } catch (err) {
    next(err);
  }
};

// @desc Get results by player id
// @route GET /api/results/:playerId
// @access Public
exports.getResultByPlayerId = async (req, res, next) => {
  try {
    const result = await AuctionResult.findOne({ player: req.params.playerId })
      .populate('player')
      .populate('team');

    if (!result) {
      return res.status(404).json({
        success: false,
        message: 'No auction result found for this player'
      });
    }

    res.status(200).json({
      success: true,
      data: result
    });
  } catch (err) {
    next(err);
  }
};

// @desc Get leaderboard statistics
// @route GET /api/results/leaderboard
// @access Public
exports.getLeaderboard = async (req, res, next) => {
  try {
    const teams = await Team.find().populate('players.player');

    // Process team stats
    const teamLeaderboard = teams.map((team) => {
      const spent = team.initialPurse - team.remainingPurse;
      const count = team.players.length;
      const avgPrice = count > 0 ? Math.round(spent / count) : 0;
      return {
        _id: team._id,
        name: team.name,
        shortName: team.shortName,
        logo: team.logo,
        primaryColor: team.primaryColor,
        totalSpent: spent,
        remainingPurse: team.remainingPurse,
        playersBought: count,
        avgPrice
      };
    });

    // Sort by spending descending
    teamLeaderboard.sort((a, b) => b.totalSpent - a.totalSpent);

    // Most expensive players
    const topPlayers = await Player.find({ status: 'SOLD' })
      .sort({ soldPrice: -1 })
      .limit(10)
      .populate('soldTo', 'name shortName logo primaryColor');

    // Highlights
    const highestSpendingTeam = teamLeaderboard[0] || null;
    const mostExpensivePlayer = topPlayers[0] || null;

    res.status(200).json({
      success: true,
      data: {
        teamLeaderboard,
        topPlayers,
        highlights: {
          highestSpendingTeam,
          mostExpensivePlayer
        }
      }
    });
  } catch (err) {
    next(err);
  }
};
