const express = require('express');
const router = express.Router();
const {
  getResults,
  getResultByPlayerId,
  getLeaderboard
} = require('../controllers/resultController');

router.get('/', getResults);
router.get('/leaderboard', getLeaderboard);
router.get('/:playerId', getResultByPlayerId);

module.exports = router;
