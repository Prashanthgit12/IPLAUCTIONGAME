const mongoose = require('mongoose');

const teamSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide a team name'],
      unique: true,
      trim: true
    },
    shortName: {
      type: String,
      required: [true, 'Please provide a short name (e.g. MM, CC)'],
      trim: true,
      uppercase: true,
      maxlength: 4
    },
    logo: {
      type: String,
      default: ''
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    initialPurse: {
      type: Number,
      default: 1200000000 // 120 Cr in INR
    },
    remainingPurse: {
      type: Number,
      default: 1200000000
    },
    players: [
      {
        player: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Player'
        },
        buyPrice: {
          type: Number,
          required: true
        },
        boughtAt: {
          type: Date,
          default: Date.now
        }
      }
    ],
    maxSquadSize: {
      type: Number,
      default: 25
    },
    maxOverseas: {
      type: Number,
      default: 8
    },
    primaryColor: {
      type: String,
      default: '#00f0ff'
    },
    secondaryColor: {
      type: String,
      default: '#0d1b33'
    },
    rtmCards: {
      type: Number,
      default: 2
    },
    rtmUsed: {
      type: Number,
      default: 0
    },
    playingXI: [
      {
        player: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Player'
        },
        position: {
          type: Number
        },
        isCaptain: {
          type: Boolean,
          default: false
        },
        isKeeper: {
          type: Boolean,
          default: false
        }
      }
    ]
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Team', teamSchema);
