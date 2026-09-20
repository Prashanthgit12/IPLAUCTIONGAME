const mongoose = require('mongoose');

const playerSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide player name'],
      trim: true
    },
    country: {
      type: String,
      required: [true, 'Please provide country'],
      trim: true
    },
    isOverseas: {
      type: Boolean,
      default: false
    },
    role: {
      type: String,
      enum: ['BATTER', 'BOWLER', 'ALL_ROUNDER', 'WICKET_KEEPER'],
      required: true
    },
    category: {
      type: String,
      enum: ['MARQUEE', 'CAPPED', 'UNCAPPED', 'EMERGING'],
      default: 'CAPPED'
    },
    isCapped: {
      type: Boolean,
      default: true
    },
    auctionSet: {
      type: String,
      default: 'BA1'
    },
    bowlingType: {
      type: String,
      enum: ['PACE', 'SPIN', 'NONE'],
      default: 'NONE'
    },
    battingPosition: {
      type: String,
      enum: ['TOP_ORDER', 'MIDDLE_ORDER', 'FINISHER', 'LOWER_ORDER'],
      default: 'TOP_ORDER'
    },
    age: {
      type: Number,
      default: 25
    },
    battingStyle: {
      type: String,
      default: 'Right-hand bat'
    },
    bowlingStyle: {
      type: String,
      default: 'Right-arm fast'
    },
    basePrice: {
      type: Number,
      required: true,
      default: 2000000 // 20 Lakhs
    },
    image: {
      type: String,
      default: ''
    },
    status: {
      type: String,
      enum: ['AVAILABLE', 'IN_AUCTION', 'SOLD', 'UNSOLD'],
      default: 'AVAILABLE'
    },
    soldTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Team',
      default: null
    },
    previousTeam: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Team',
      default: null
    },
    previousTeamName: {
      type: String,
      default: ''
    },
    soldPrice: {
      type: Number,
      default: 0
    },
    stats: {
      matches: { type: Number, default: 0 },
      runs: { type: Number, default: 0 },
      highestScore: { type: String, default: '0' },
      wickets: { type: Number, default: 0 },
      bestBowling: { type: String, default: '0/0' },
      strikeRate: { type: Number, default: 120.0 },
      economy: { type: Number, default: 8.0 }
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Player', playerSchema);
