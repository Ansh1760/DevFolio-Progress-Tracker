const express = require('express');
const { getTodayTracker, updateTracker } = require('../controllers/trackerController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/today', protect, getTodayTracker);
router.put('/:id', protect, updateTracker);

module.exports = router;
