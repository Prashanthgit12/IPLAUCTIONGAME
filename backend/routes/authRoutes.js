const express = require('express');
const router = express.Router();
const { register, login, getMe, assignTeam } = require('../controllers/authController');
const { authenticateUser } = require('../middleware/authMiddleware');

router.post('/register', register);
router.post('/login', login);
router.get('/me', authenticateUser, getMe);
router.put('/team', authenticateUser, assignTeam);

module.exports = router;
