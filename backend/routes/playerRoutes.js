const express = require('express');
const router = express.Router();
const {
  getPlayers,
  getPlayerById,
  createPlayer,
  updatePlayer,
  deletePlayer
} = require('../controllers/playerController');
const { authenticateUser, requireAdmin } = require('../middleware/authMiddleware');

router.route('/')
  .get(getPlayers)
  .post(authenticateUser, requireAdmin, createPlayer);

router.route('/:id')
  .get(getPlayerById)
  .put(authenticateUser, requireAdmin, updatePlayer)
  .delete(authenticateUser, requireAdmin, deletePlayer);

module.exports = router;
