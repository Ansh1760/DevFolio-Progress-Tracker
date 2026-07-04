const express = require('express');
const { adminLogin, getDashboardStats, getAllUsers, deleteUser, pushNotification } = require('../controllers/adminController');
const { protectAdmin } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/login', adminLogin);
router.get('/stats', protectAdmin, getDashboardStats);
router.get('/users', protectAdmin, getAllUsers);
router.delete('/users/:id', protectAdmin, deleteUser);
router.post('/notifications', protectAdmin, pushNotification);

module.exports = router;
