const dotenv = require('dotenv');
dotenv.config();

module.exports = {
  PORT: process.env.PORT || 5000,
  MONGO_URI: process.env.MONGO_URI || 'mongodb://localhost:27017/auctionx',
  JWT_SECRET: process.env.JWT_SECRET || 'auctionx_super_secure_jwt_secret_key_2026',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
  CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:5173',
  AUCTION_DEFAULTS: {
    INITIAL_PURSE: 1200000000, // 120 Crores in INR (₹120,00,00,000)
    MAX_SQUAD: 25,
    MIN_SQUAD: 18,
    MAX_OVERSEAS: 8,
    TIMER_SECONDS: 15,
    RESET_TIMER_SECONDS: 10,
    SNIPE_THRESHOLD_SECONDS: 5
  }
};
