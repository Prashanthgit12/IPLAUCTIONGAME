const Trade = require('../models/Trade');
const Team = require('../models/Team');
const Player = require('../models/Player');
const auctionEngine = require('../services/auctionEngine');

// @desc Propose a bilateral player trade
// @route POST /api/trades
// @access Public / Authenticated
exports.proposeTrade = async (req, res, next) => {
  try {
    let { proposerTeamId, targetTeamId, proposerPlayerId, targetPlayerId, cashAdjustment, notes } = req.body;

    // If proposerTeamId not explicitly passed, try from authenticated user
    if (!proposerTeamId && req.user && req.user.team) {
      proposerTeamId = req.user.team._id || req.user.team;
    }

    if (!proposerTeamId || !targetTeamId || !proposerPlayerId || !targetPlayerId) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both franchises and players to propose trade'
      });
    }

    if (proposerTeamId.toString() === targetTeamId.toString()) {
      return res.status(400).json({
        success: false,
        message: 'Cannot propose a trade with the same franchise'
      });
    }

    const proposerTeam = await Team.findById(proposerTeamId);
    const targetTeam = await Team.findById(targetTeamId);
    const proposerPlayer = await Player.findById(proposerPlayerId);
    const targetPlayer = await Player.findById(targetPlayerId);

    if (!proposerTeam || !targetTeam || !proposerPlayer || !targetPlayer) {
      return res.status(400).json({
        success: false,
        message: 'Invalid franchise or player specified for trade'
      });
    }

    const cashAdj = Number(cashAdjustment) || 0;

    // Check cash limits
    if (cashAdj > 0 && proposerTeam.remainingPurse < cashAdj) {
      return res.status(400).json({
        success: false,
        message: `${proposerTeam.shortName} does not have sufficient purse (Remaining: ₹${(proposerTeam.remainingPurse / 10000000).toFixed(2)} Cr) for cash payout`
      });
    }
    if (cashAdj < 0 && targetTeam.remainingPurse < Math.abs(cashAdj)) {
      return res.status(400).json({
        success: false,
        message: `${targetTeam.shortName} does not have sufficient purse for requested cash adjustment`
      });
    }

    const trade = await Trade.create({
      proposerTeam: proposerTeamId,
      targetTeam: targetTeamId,
      proposerPlayer: proposerPlayerId,
      targetPlayer: targetPlayerId,
      cashAdjustment: cashAdj,
      notes: notes || '',
      status: 'PENDING'
    });

    const populated = await Trade.findById(trade._id)
      .populate('proposerTeam', 'name shortName logo primaryColor remainingPurse')
      .populate('targetTeam', 'name shortName logo primaryColor remainingPurse')
      .populate('proposerPlayer', 'name role image country isOverseas basePrice soldPrice')
      .populate('targetPlayer', 'name role image country isOverseas basePrice soldPrice');

    if (auctionEngine.io) {
      auctionEngine.io.emit('trade:update', {
        action: 'PROPOSED',
        trade: populated
      });
    }

    res.status(201).json({
      success: true,
      data: populated,
      message: 'Trade proposal dispatched successfully!'
    });
  } catch (err) {
    next(err);
  }
};

// @desc Get all trades (optionally filtered by teamId)
// @route GET /api/trades
// @access Public
exports.getTrades = async (req, res, next) => {
  try {
    const { teamId } = req.query;
    let query = {};
    if (teamId) {
      query = {
        $or: [{ proposerTeam: teamId }, { targetTeam: teamId }]
      };
    }

    const trades = await Trade.find(query)
      .sort({ createdAt: -1 })
      .populate('proposerTeam', 'name shortName logo primaryColor remainingPurse')
      .populate('targetTeam', 'name shortName logo primaryColor remainingPurse')
      .populate('proposerPlayer', 'name role image country isOverseas basePrice soldPrice')
      .populate('targetPlayer', 'name role image country isOverseas basePrice soldPrice');

    res.status(200).json({
      success: true,
      count: trades.length,
      data: trades
    });
  } catch (err) {
    next(err);
  }
};

// @desc Respond to trade proposal (ACCEPT / REJECT / CANCEL)
// @route PUT /api/trades/:id/respond
// @access Public / Authenticated
exports.respondTrade = async (req, res, next) => {
  try {
    const { action } = req.body; // 'ACCEPT' or 'REJECT' or 'CANCEL'
    const trade = await Trade.findById(req.params.id);

    if (!trade) {
      return res.status(404).json({ success: false, message: 'Trade proposal not found' });
    }

    if (trade.status !== 'PENDING') {
      return res.status(400).json({ success: false, message: `Trade is already ${trade.status}` });
    }

    if (action === 'REJECT') {
      trade.status = 'REJECTED';
      await trade.save();

      const populated = await Trade.findById(trade._id)
        .populate('proposerTeam', 'name shortName logo primaryColor remainingPurse')
        .populate('targetTeam', 'name shortName logo primaryColor remainingPurse')
        .populate('proposerPlayer', 'name role image country isOverseas')
        .populate('targetPlayer', 'name role image country isOverseas');

      if (auctionEngine.io) {
        auctionEngine.io.emit('trade:update', { action: 'REJECTED', trade: populated });
      }

      return res.status(200).json({ success: true, data: populated, message: 'Trade proposal declined' });
    }

    if (action === 'CANCEL') {
      trade.status = 'CANCELLED';
      await trade.save();

      const populated = await Trade.findById(trade._id)
        .populate('proposerTeam', 'name shortName logo primaryColor remainingPurse')
        .populate('targetTeam', 'name shortName logo primaryColor remainingPurse')
        .populate('proposerPlayer', 'name role image country isOverseas')
        .populate('targetPlayer', 'name role image country isOverseas');

      if (auctionEngine.io) {
        auctionEngine.io.emit('trade:update', { action: 'CANCELLED', trade: populated });
      }

      return res.status(200).json({ success: true, data: populated, message: 'Trade proposal cancelled' });
    }

    if (action === 'ACCEPT') {
      const proposerTeam = await Team.findById(trade.proposerTeam).populate('players.player');
      const targetTeam = await Team.findById(trade.targetTeam).populate('players.player');
      const proposerPlayer = await Player.findById(trade.proposerPlayer);
      const targetPlayer = await Player.findById(trade.targetPlayer);

      if (!proposerTeam || !targetTeam || !proposerPlayer || !targetPlayer) {
        return res.status(400).json({ success: false, message: 'Teams or players no longer exist' });
      }

      // Check overseas quota
      const pOverseasDelta = (targetPlayer.isOverseas ? 1 : 0) - (proposerPlayer.isOverseas ? 1 : 0);
      const tOverseasDelta = (proposerPlayer.isOverseas ? 1 : 0) - (targetPlayer.isOverseas ? 1 : 0);

      const pCurrentOverseas = proposerTeam.players.filter(
        (p) => (p.player && p.player.isOverseas) || false
      ).length;
      const tCurrentOverseas = targetTeam.players.filter(
        (p) => (p.player && p.player.isOverseas) || false
      ).length;

      if (pOverseasDelta > 0 && pCurrentOverseas + pOverseasDelta > (proposerTeam.maxOverseas || 8)) {
        return res.status(400).json({
          success: false,
          message: `Trade would exceed maximum overseas player limit (${proposerTeam.maxOverseas || 8}) for ${proposerTeam.shortName}`
        });
      }
      if (tOverseasDelta > 0 && tCurrentOverseas + tOverseasDelta > (targetTeam.maxOverseas || 8)) {
        return res.status(400).json({
          success: false,
          message: `Trade would exceed maximum overseas player limit (${targetTeam.maxOverseas || 8}) for ${targetTeam.shortName}`
        });
      }

      // Adjust cash
      if (trade.cashAdjustment !== 0) {
        proposerTeam.remainingPurse -= trade.cashAdjustment;
        targetTeam.remainingPurse += trade.cashAdjustment;
      }

      // Helper to match player ID whether populated or unpopulated
      const matchId = (pItem, targetId) => {
        if (!pItem) return false;
        const pid = pItem.player && pItem.player._id ? pItem.player._id.toString() : (pItem.player ? pItem.player.toString() : (pItem._id ? pItem._id.toString() : ''));
        return pid === targetId.toString();
      };

      // Swap player ownership in team rosters
      proposerTeam.players = proposerTeam.players.filter((p) => !matchId(p, proposerPlayer._id));
      proposerTeam.players.push({
        player: targetPlayer._id,
        buyPrice: targetPlayer.soldPrice || targetPlayer.basePrice,
        boughtAt: new Date()
      });

      targetTeam.players = targetTeam.players.filter((p) => !matchId(p, targetPlayer._id));
      targetTeam.players.push({
        player: proposerPlayer._id,
        buyPrice: proposerPlayer.soldPrice || proposerPlayer.basePrice,
        boughtAt: new Date()
      });

      // Update Player soldTo & soldPrice
      proposerPlayer.soldTo = targetTeam._id;
      if (!proposerPlayer.soldPrice) proposerPlayer.soldPrice = proposerPlayer.basePrice;
      targetPlayer.soldTo = proposerTeam._id;
      if (!targetPlayer.soldPrice) targetPlayer.soldPrice = targetPlayer.basePrice;

      await proposerPlayer.save();
      await targetPlayer.save();
      await proposerTeam.save();
      await targetTeam.save();

      trade.status = 'ACCEPTED';
      await trade.save();

      const populated = await Trade.findById(trade._id)
        .populate('proposerTeam', 'name shortName logo primaryColor remainingPurse')
        .populate('targetTeam', 'name shortName logo primaryColor remainingPurse')
        .populate('proposerPlayer', 'name role image country isOverseas basePrice soldPrice')
        .populate('targetPlayer', 'name role image country isOverseas basePrice soldPrice');

      if (auctionEngine.io) {
        auctionEngine.io.emit('trade:update', {
          action: 'ACCEPTED',
          trade: populated
        });
        auctionEngine.io.emit('team:update', {
          teams: [proposerTeam._id, targetTeam._id]
        });
      }

      return res.status(200).json({
        success: true,
        data: populated,
        message: `Trade officially executed! ${proposerPlayer.name} is now with ${targetTeam.shortName}, and ${targetPlayer.name} joined ${proposerTeam.shortName}.`
      });
    }

    res.status(400).json({ success: false, message: 'Invalid trade action' });
  } catch (err) {
    next(err);
  }
};
