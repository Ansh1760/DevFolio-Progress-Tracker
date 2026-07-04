const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Transaction = require('../models/Transaction');
const DailyTracker = require('../models/DailyTracker');
const Notification = require('../models/Notification');

const generateAdminToken = () => {
    return jwt.sign({ role: 'superadmin' }, process.env.JWT_SECRET, {
        expiresIn: '1d',
    });
};

exports.adminLogin = async (req, res) => {
    try {
        const { adminId, password } = req.body;
        
        if (adminId === process.env.ADMIN_ID && password === process.env.ADMIN_PASSWORD) {
            res.status(200).json({
                success: true,
                token: generateAdminToken()
            });
        } else {
            res.status(401).json({ success: false, message: 'Invalid Admin Credentials' });
        }
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getDashboardStats = async (req, res) => {
    try {
        const totalUsers = await User.countDocuments();
        const activeUsers = await User.countDocuments({ lastActive: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } }); // Active in last 7 days
        
        const linkedinConnected = await User.countDocuments({ "linkedin.profileUrl": { $ne: "" }, linkedin: { $exists: true } });
        const githubConnected = await User.countDocuments({ githubUsername: { $ne: "" } });
        const leetcodeConnected = await User.countDocuments({ leetcodeUsername: { $ne: "" } });
        const gfgConnected = await User.countDocuments({ gfgUsername: { $ne: "" } });
        const codeforcesConnected = await User.countDocuments({ codeforcesUsername: { $ne: "" } });
        
        const users = await User.find({}, 'coins');
        const totalCoins = users.reduce((acc, curr) => acc + (curr.coins || 0), 0);
        
        const totalProfilesSynced = await User.countDocuments({ lastPlatformSync: { $exists: true } });
        
        const startOfToday = new Date();
        startOfToday.setHours(0, 0, 0, 0);
        const newUsersToday = await User.countDocuments({ createdAt: { $gte: startOfToday } });
        
        res.status(200).json({
            success: true,
            data: {
                totalUsers,
                activeUsers,
                linkedinConnected,
                githubConnected,
                leetcodeConnected,
                gfgConnected,
                codeforcesConnected,
                totalCoins,
                totalProfilesSynced,
                newUsersToday
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.find({}).sort({ createdAt: -1 });
        res.status(200).json({ success: true, data: users });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.deleteUser = async (req, res) => {
    try {
        const { adminPassword } = req.body;
        
        if (adminPassword !== process.env.ADMIN_PASSWORD) {
            return res.status(401).json({ success: false, message: 'Invalid Admin Password' });
        }
        
        const userId = req.params.id;
        
        // Delete all traces of user
        await Transaction.deleteMany({ user: userId });
        await DailyTracker.deleteMany({ user: userId });
        await User.findByIdAndDelete(userId);
        
        res.status(200).json({ success: true, message: 'User completely removed from system' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.pushNotification = async (req, res) => {
    try {
        const { title, message, type } = req.body;
        
        if (!title || !message) {
            return res.status(400).json({ success: false, message: 'Please provide title and message' });
        }
        
        const notification = await Notification.create({
            title,
            message,
            type: type || 'info',
            isGlobal: true
        });
        
        // Push to active SSE clients
        const { sendNotificationToAll } = require('../utils/sse');
        sendNotificationToAll(notification);
        
        res.status(201).json({ success: true, data: notification });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
