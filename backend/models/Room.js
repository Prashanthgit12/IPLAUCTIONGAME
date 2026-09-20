const mongoose = require('mongoose');

const roomMemberSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['HOST', 'MEMBER', 'SPECTATOR'],
    default: 'MEMBER'
  },
  team: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Team',
    default: null
  },
  socketId: {
    type: String,
    default: null
  },
  joinedAt: {
    type: Date,
    default: Date.now
  }
});

const roomSchema = new mongoose.Schema(
  {
    roomCode: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
      index: true
    },
    name: {
      type: String,
      required: true,
      trim: true,
      default: 'IPL Friends Auction'
    },
    hostName: {
      type: String,
      required: true,
      default: 'Host'
    },
    hostTeam: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Team',
      default: null
    },
    isPrivate: {
      type: Boolean,
      default: true
    },
    status: {
      type: String,
      enum: ['LOBBY', 'LIVE', 'FINISHED'],
      default: 'LOBBY'
    },
    rules: {
      initialPurse: {
        type: Number,
        default: 1200000000 // 120 Cr
      },
      timerSeconds: {
        type: Number,
        default: 15
      },
      maxTeams: {
        type: Number,
        default: 10
      }
    },
    members: [roomMemberSchema],
    auctionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Auction',
      default: null
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Room', roomSchema);
