const mongoose = require('mongoose');

const auctionResultSchema = new mongoose.Schema(
  {
    auction: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Auction',
      required: true
    },
    player: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Player',
      required: true
    },
    team: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Team',
      default: null
    },
    soldPrice: {
      type: Number,
      default: 0
    },
    status: {
      type: String,
      enum: ['SOLD', 'UNSOLD'],
      required: true
    },
    numberOfBids: {
      type: Number,
      default: 0
    },
    timestamp: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('AuctionResult', auctionResultSchema);
