const express = require('express');
const { getDashboardData, getLeaderboard, searchUsers, getPublicProfile, getNotifications, notificationStream, toggleStar } = require('../controllers/userController');
const { syncGfg } = require('../controllers/gfgController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/dashboard', protect, getDashboardData);
router.get('/leaderboard', protect, getLeaderboard);
router.get('/search', protect, searchUsers);
router.get('/profile/:id', protect, getPublicProfile);
router.post('/sync-gfg', protect, syncGfg);
router.post('/star/:id', protect, toggleStar);
router.get('/notifications', protect, getNotifications);
router.get('/notifications/stream', protect, notificationStream);

module.exports = router;
