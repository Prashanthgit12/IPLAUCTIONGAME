const express = require('express');
const router = express.Router();
const {
  getActiveAuction,
  getAuctions,
  createAuction,
  startAuction,
  pauseAuction,
  pauseOnSignout,
  resumeAuction,
  endAuction,
  markSold,
  markUnsold,
  nextPlayer,
  placeBid,
  getAuctionBids
} = require('../controllers/auctionController');
const { authenticateUser, requireAdmin, requireTeamOwner } = require('../middleware/authMiddleware');

router.get('/active', getActiveAuction);
router.get('/', getAuctions);
router.post('/', authenticateUser, requireAdmin, createAuction);
router.post('/pause-on-signout', pauseOnSignout);

router.post('/:id/start', authenticateUser, requireAdmin, startAuction);
router.post('/:id/pause', authenticateUser, requireAdmin, pauseAuction);
router.post('/:id/resume', authenticateUser, requireAdmin, resumeAuction);
router.post('/:id/end', authenticateUser, requireAdmin, endAuction);

router.post('/:id/sold', authenticateUser, requireAdmin, markSold);
router.post('/:id/unsold', authenticateUser, requireAdmin, markUnsold);
router.post('/:id/next-player', authenticateUser, requireAdmin, nextPlayer);

router.post('/:id/bid', authenticateUser, requireTeamOwner, placeBid);
router.get('/:id/bids', getAuctionBids);

module.exports = router;
