const express = require('express');
const router = express.Router();
const {
  createRoom,
  getRoomByCode,
  joinRoom,
  claimTeam,
  getPublicRooms,
  startRoomAuction
} = require('../controllers/roomController');

router.route('/')
  .get(getPublicRooms)
  .post(createRoom);

router.route('/:roomCode')
  .get(getRoomByCode);

router.route('/:roomCode/join')
  .post(joinRoom);

router.route('/:roomCode/claim-team')
  .post(claimTeam);

router.route('/:roomCode/start')
  .post(startRoomAuction);

module.exports = router;
