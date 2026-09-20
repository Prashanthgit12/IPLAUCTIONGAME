const Player = require('../models/Player');
const Bid = require('../models/Bid');

// @desc Get all players with filters & search
// @route GET /api/players
// @access Public
exports.getPlayers = async (req, res, next) => {
  try {
    const { search, role, country, category, status, minPrice, maxPrice, isOverseas, sort, isCapped, auctionSet, bowlingType } = req.query;

    let query = {};

    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }

    if (role && role !== 'ALL') {
      query.role = role;
    }

    if (country && country !== 'ALL') {
      query.country = country;
    }

    if (category && category !== 'ALL') {
      query.category = category;
    }

    if (status && status !== 'ALL') {
      query.status = status;
    }

    if (isOverseas !== undefined && isOverseas !== '') {
      query.isOverseas = isOverseas === 'true';
    }

    if (isCapped !== undefined && isCapped !== '' && isCapped !== 'ALL') {
      query.isCapped = isCapped === 'true' || isCapped === true;
    }

    if (auctionSet && auctionSet !== 'ALL') {
      query.auctionSet = auctionSet;
    }

    if (bowlingType && bowlingType !== 'ALL') {
      query.bowlingType = bowlingType;
    }

    if (minPrice || maxPrice) {
      query.basePrice = {};
      if (minPrice) query.basePrice.$gte = Number(minPrice);
      if (maxPrice) query.basePrice.$lte = Number(maxPrice);
    }

    let sortOption = { basePrice: -1 };
    if (sort === 'name_asc') sortOption = { name: 1 };
    else if (sort === 'name_desc') sortOption = { name: -1 };
    else if (sort === 'price_asc') sortOption = { basePrice: 1 };
    else if (sort === 'price_desc') sortOption = { basePrice: -1 };
    else if (sort === 'sold_desc') sortOption = { soldPrice: -1 };

    const players = await Player.find(query).sort(sortOption).populate('soldTo', 'name shortName logo primaryColor');

    res.status(200).json({
      success: true,
      count: players.length,
      data: players
    });
  } catch (err) {
    next(err);
  }
};

// @desc Get single player by id
// @route GET /api/players/:id
// @access Public
exports.getPlayerById = async (req, res, next) => {
  try {
    const player = await Player.findById(req.params.id).populate('soldTo', 'name shortName logo primaryColor remainingPurse');
    if (!player) {
      return res.status(404).json({
        success: false,
        message: 'Player not found'
      });
    }

    // Fetch bid history for this player
    const bids = await Bid.find({ player: player._id })
      .sort({ timestamp: -1 })
      .populate('team', 'name shortName logo primaryColor')
      .populate('bidder', 'name email');

    res.status(200).json({
      success: true,
      data: {
        player,
        bids
      }
    });
  } catch (err) {
    next(err);
  }
};

// @desc Create new player
// @route POST /api/players
// @access Private (Admin)
exports.createPlayer = async (req, res, next) => {
  try {
    const player = await Player.create(req.body);
    res.status(201).json({
      success: true,
      data: player
    });
  } catch (err) {
    next(err);
  }
};

// @desc Update player
// @route PUT /api/players/:id
// @access Private (Admin)
exports.updatePlayer = async (req, res, next) => {
  try {
    const player = await Player.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    if (!player) {
      return res.status(404).json({
        success: false,
        message: 'Player not found'
      });
    }

    res.status(200).json({
      success: true,
      data: player
    });
  } catch (err) {
    next(err);
  }
};

// @desc Delete player
// @route DELETE /api/players/:id
// @access Private (Admin)
exports.deletePlayer = async (req, res, next) => {
  try {
    const player = await Player.findById(req.params.id);
    if (!player) {
      return res.status(404).json({
        success: false,
        message: 'Player not found'
      });
    }

    await player.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Player deleted successfully'
    });
  } catch (err) {
    next(err);
  }
};
