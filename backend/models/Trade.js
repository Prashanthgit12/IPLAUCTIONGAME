const mongoose = require('mongoose');

const tradeSchema = new mongoose.Schema(
  {
    proposerTeam: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Team',
      required: true
    },
    targetTeam: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Team',
      required: true
    },
    proposerPlayer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Player',
      required: true
    },
    targetPlayer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Player',
      required: true
    },
    cashAdjustment: {
      type: Number,
      default: 0 // positive: proposer pays target; negative: proposer receives
    },
    notes: {
      type: String,
      default: ''
    },
    status: {
      type: String,
      enum: ['PENDING', 'ACCEPTED', 'REJECTED', 'CANCELLED'],
      default: 'PENDING'
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Trade', tradeSchema);
