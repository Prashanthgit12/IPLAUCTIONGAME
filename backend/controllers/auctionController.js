const Auction = require('../models/Auction');
const Bid = require('../models/Bid');
const auctionEngine = require('../services/auctionEngine');

// @desc Get active auction state
// @route GET /api/auctions/active
// @access Public
exports.getActiveAuction = async (req, res, next) => {
  try {
    const auction = await auctionEngine.getOrCreateActiveAuction();

    let bids = [];
    if (auction && auction.currentPlayer) {
      bids = await Bid.find({ player: auction.currentPlayer._id })
        .sort({ timestamp: -1 })
        .limit(15)
        .populate('team', 'name shortName logo primaryColor')
        .populate('bidder', 'name email');
    }

    res.status(200).json({
      success: true,
      data: {
        auction,
        bids,
        remainingSeconds: auctionEngine.remainingSeconds,
        isTimerRunning: auctionEngine.isTimerRunning
      }
    });
  } catch (err) {
    next(err);
  }
};

// @desc Get all auctions
// @route GET /api/auctions
// @access Public
exports.getAuctions = async (req, res, next) => {
  try {
    const auctions = await Auction.find().sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      count: auctions.length,
      data: auctions
    });
  } catch (err) {
    next(err);
  }
};

// @desc Create auction
// @route POST /api/auctions
// @access Private (Admin)
exports.createAuction = async (req, res, next) => {
  try {
    const auction = await Auction.create(req.body);
    res.status(201).json({
      success: true,
      data: auction
    });
  } catch (err) {
    next(err);
  }
};

// @desc Start auction
// @route POST /api/auctions/:id/start
// @access Private (Admin)
exports.startAuction = async (req, res, next) => {
  try {
    const auction = await auctionEngine.startAuction(req.params.id);
    res.status(200).json({
      success: true,
      data: auction
    });
  } catch (err) {
    next(err);
  }
};

// @desc Pause auction
// @route POST /api/auctions/:id/pause
// @access Private (Admin)
exports.pauseAuction = async (req, res, next) => {
  try {
    const auction = await auctionEngine.pauseAuction(req.params.id);
    res.status(200).json({
      success: true,
      data: auction
    });
  } catch (err) {
    next(err);
  }
};

// @desc Pause active auction on user signout
// @route POST /api/auctions/pause-on-signout
// @access Public / Authenticated
exports.pauseOnSignout = async (req, res, next) => {
  try {
    const auction = await auctionEngine.getOrCreateActiveAuction();
    if (auction && auction.status === 'LIVE') {
      await auctionEngine.pauseAuction(auction._id);
    }
    res.status(200).json({
      success: true,
      message: 'Auction paused on signout'
    });
  } catch (err) {
    next(err);
  }
};

// @desc Resume auction
// @route POST /api/auctions/:id/resume
// @access Private (Admin)
exports.resumeAuction = async (req, res, next) => {
  try {
    const auction = await auctionEngine.resumeAuction(req.params.id);
    res.status(200).json({
      success: true,
      data: auction
    });
  } catch (err) {
    next(err);
  }
};

// @desc End auction
// @route POST /api/auctions/:id/end
// @access Private (Admin)
exports.endAuction = async (req, res, next) => {
  try {
    const auction = await auctionEngine.endAuction(req.params.id);
    res.status(200).json({
      success: true,
      data: auction
    });
  } catch (err) {
    next(err);
  }
};

// @desc Mark current player SOLD
// @route POST /api/auctions/:id/sold
// @access Private (Admin)
exports.markSold = async (req, res, next) => {
  try {
    const result = await auctionEngine.markSold(req.params.id);
    res.status(200).json({
      success: true,
      data: result
    });
  } catch (err) {
    next(err);
  }
};

// @desc Mark current player UNSOLD
// @route POST /api/auctions/:id/unsold
// @access Private (Admin)
exports.markUnsold = async (req, res, next) => {
  try {
    const result = await auctionEngine.markUnsold(req.params.id);
    res.status(200).json({
      success: true,
      data: result
    });
  } catch (err) {
    next(err);
  }
};

// @desc Move to next player
// @route POST /api/auctions/:id/next-player
// @access Private (Admin)
exports.nextPlayer = async (req, res, next) => {
  try {
    const { playerId } = req.body;
    const auction = await auctionEngine.nextPlayer(req.params.id, playerId);
    res.status(200).json({
      success: true,
      data: auction
    });
  } catch (err) {
    next(err);
  }
};

// @desc Place bid via REST API
// @route POST /api/auctions/:id/bid
// @access Private (Team Owner)
exports.placeBid = async (req, res, next) => {
  try {
    const { teamId, amount } = req.body;
    const result = await auctionEngine.placeBid({
      auctionId: req.params.id,
      userId: req.user._id,
      userRole: req.user.role,
      teamId: teamId || (req.user.team ? req.user.team._id : null),
      amount
    });

    res.status(200).json({
      success: true,
      data: result
    });
  } catch (err) {
    next(err);
  }
};

// @desc Get bids for an auction
// @route GET /api/auctions/:id/bids
// @access Public
exports.getAuctionBids = async (req, res, next) => {
  try {
    const bids = await Bid.find({ auction: req.params.id })
      .sort({ timestamp: -1 })
      .limit(50)
      .populate('player', 'name role country image')
      .populate('team', 'name shortName logo primaryColor')
      .populate('bidder', 'name email');

    res.status(200).json({
      success: true,
      count: bids.length,
      data: bids
    });
  } catch (err) {
    next(err);
  }
};
