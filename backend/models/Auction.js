const mongoose = require('mongoose');

const auctionSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      default: 'Premier Cricket Auction 2026'
    },
    status: {
      type: String,
      enum: ['IDLE', 'LIVE', 'PAUSED', 'ENDED'],
      default: 'IDLE'
    },
    currentPlayer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Player',
      default: null
    },
    currentBid: {
      type: Number,
      default: 0
    },
    currentTeam: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Team',
      default: null
    },
    timerEndsAt: {
      type: Date,
      default: null
    },
    bidIncrement: {
      type: Number,
      default: 2500000 // 25 Lakhs
    },
    currentRound: {
      type: Number,
      default: 1
    },
    startedAt: {
      type: Date,
      default: null
    },
    endedAt: {
      type: Date,
      default: null
    },
    rules: {
      initialPurse: { type: Number, default: 1200000000 },
      maxSquadSize: { type: Number, default: 25 },
      minSquadSize: { type: Number, default: 18 },
      maxOverseas: { type: Number, default: 8 },
      timerSeconds: { type: Number, default: 15 },
      resetTimerSeconds: { type: Number, default: 10 },
      snipeThresholdSeconds: { type: Number, default: 5 }
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Auction', auctionSchema);
