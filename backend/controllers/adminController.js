const Player = require('../models/Player');
const Team = require('../models/Team');
const User = require('../models/User');
const Bid = require('../models/Bid');
const AuctionResult = require('../models/AuctionResult');
const Auction = require('../models/Auction');
const auctionEngine = require('../services/auctionEngine');

// @desc Get comprehensive admin dashboard analytics
// @route GET /api/admin/dashboard
// @access Private (Admin)
exports.getDashboardStats = async (req, res, next) => {
  try {
    const totalPlayers = await Player.countDocuments();
    const soldPlayersCount = await Player.countDocuments({ status: 'SOLD' });
    const unsoldPlayersCount = await Player.countDocuments({ status: 'UNSOLD' });
    const availablePlayersCount = await Player.countDocuments({ status: 'AVAILABLE' });
    const totalTeams = await Team.countDocuments();
    const totalUsers = await User.countDocuments();
    const ownersCount = await User.countDocuments({ role: 'TEAM_OWNER' });
    const spectatorsCount = await User.countDocuments({ role: 'SPECTATOR' });
    const adminsCount = await User.countDocuments({ role: 'ADMIN' });

    const registeredUsers = await User.find()
      .select('-password')
      .populate('team', 'name shortName primaryColor logo')
      .sort({ createdAt: -1 });

    const totalBids = await Bid.countDocuments();

    // Spending by team
    const teams = await Team.find().select('name shortName initialPurse remainingPurse players primaryColor');
    const spendingByTeam = teams.map((team) => ({
      name: team.name,
      shortName: team.shortName,
      spent: team.initialPurse - team.remainingPurse,
      remaining: team.remainingPurse,
      playersCount: team.players.length,
      primaryColor: team.primaryColor
    }));

    const totalMoneySpent = spendingByTeam.reduce((acc, curr) => acc + curr.spent, 0);
    const avgPlayerPrice = soldPlayersCount > 0 ? Math.round(totalMoneySpent / soldPlayersCount) : 0;

    // Players by role
    const batters = await Player.countDocuments({ role: 'BATTER' });
    const bowlers = await Player.countDocuments({ role: 'BOWLER' });
    const allRounders = await Player.countDocuments({ role: 'ALL_ROUNDER' });
    const wicketKeepers = await Player.countDocuments({ role: 'WICKET_KEEPER' });

    // Most expensive players
    const topPlayers = await Player.find({ status: 'SOLD' })
      .sort({ soldPrice: -1 })
      .limit(5)
      .populate('soldTo', 'name shortName logo primaryColor');

    // Recent activity
    const recentBids = await Bid.find()
      .sort({ timestamp: -1 })
      .limit(8)
      .populate('player', 'name role')
      .populate('team', 'name shortName primaryColor');

    res.status(200).json({
      success: true,
      data: {
        metrics: {
          totalPlayers,
          soldPlayers: soldPlayersCount,
          unsoldPlayers: unsoldPlayersCount,
          availablePlayers: availablePlayersCount,
          totalTeams,
          totalUsers,
          ownersCount,
          spectatorsCount,
          adminsCount,
          totalBids,
          totalMoneySpent,
          avgPlayerPrice
        },
        registeredUsers,
        spendingByTeam,
        playersByRole: {
          batters,
          bowlers,
          allRounders,
          wicketKeepers
        },
        topPlayers,
        recentBids
      }
    });
  } catch (err) {
    next(err);
  }
};

// @desc Update auction rules
// @route PUT /api/admin/rules
// @access Private (Admin)
exports.updateAuctionRules = async (req, res, next) => {
  try {
    const { timerSeconds, resetTimerSeconds, snipeThresholdSeconds, maxSquadSize, maxOverseas } = req.body;

    const auction = await Auction.findOne({ status: { $in: ['LIVE', 'PAUSED', 'IDLE'] } });
    if (!auction) {
      return res.status(404).json({ success: false, message: 'No active auction found' });
    }

    if (timerSeconds) auction.rules.timerSeconds = Number(timerSeconds);
    if (resetTimerSeconds) auction.rules.resetTimerSeconds = Number(resetTimerSeconds);
    if (snipeThresholdSeconds) auction.rules.snipeThresholdSeconds = Number(snipeThresholdSeconds);
    if (maxSquadSize) auction.rules.maxSquadSize = Number(maxSquadSize);
    if (maxOverseas) auction.rules.maxOverseas = Number(maxOverseas);

    await auction.save();

    res.status(200).json({
      success: true,
      data: auction.rules
    });
  } catch (err) {
    next(err);
  }
};

// @desc Reset auction to starting cricketer (Virat Kohli) with 0 bids
// @route POST /api/admin/reset-auction
// @access Private (Admin)
exports.resetAuction = async (req, res, next) => {
  try {
    const updatedAuction = await auctionEngine.resetAuctionToStart();
    res.status(200).json({
      success: true,
      message: 'Auction reset to starting cricketer (Virat Kohli) with 0 bids',
      data: updatedAuction
    });
  } catch (err) {
    next(err);
  }
};
