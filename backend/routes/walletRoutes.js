const express = require('express');
const {
    dailyLogin,
    platformSync,
    dailyTracker,
    getHistory,
    getBalance,
    purchaseBadge
} = require('../controllers/walletController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/daily-login', protect, dailyLogin);
router.post('/platform-sync', protect, platformSync);
router.post('/daily-tracker', protect, dailyTracker);
router.post('/redeem-badge', protect, purchaseBadge);
router.get('/history', protect, getHistory);
router.get('/balance', protect, getBalance);

module.exports = router;
