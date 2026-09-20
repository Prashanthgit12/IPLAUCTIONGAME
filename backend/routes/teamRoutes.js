const express = require('express');
const router = express.Router();
const {
  getTeams,
  getTeamById,
  createTeam,
  updateTeam,
  deleteTeam,
  updatePlayingXI
} = require('../controllers/teamController');
const { authenticateUser, requireAdmin } = require('../middleware/authMiddleware');

router.route('/')
  .get(getTeams)
  .post(authenticateUser, requireAdmin, createTeam);

router.put('/:id/playing-xi', authenticateUser, updatePlayingXI);

router.route('/:id')
  .get(getTeamById)
  .put(authenticateUser, requireAdmin, updateTeam)
  .delete(authenticateUser, requireAdmin, deleteTeam);

module.exports = router;
