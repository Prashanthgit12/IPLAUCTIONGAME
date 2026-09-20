const express = require('express');
const router = express.Router();
const { proposeTrade, getTrades, respondTrade } = require('../controllers/tradeController');
const { optionalAuth } = require('../middleware/authMiddleware');

router.route('/')
  .get(getTrades)
  .post(optionalAuth, proposeTrade);

router.route('/:id/respond')
  .put(optionalAuth, respondTrade);

module.exports = router;
