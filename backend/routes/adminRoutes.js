const express = require('express');
const router = express.Router();
const {
  getDashboardStats,
  updateAuctionRules,
  resetAuction
} = require('../controllers/adminController');
const { authenticateUser, requireAdmin } = require('../middleware/authMiddleware');

router.use(authenticateUser, requireAdmin);

router.get('/dashboard', getDashboardStats);
router.put('/rules', updateAuctionRules);
router.post('/reset-auction', resetAuction);

module.exports = router;
