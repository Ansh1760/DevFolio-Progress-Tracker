const User = require('../models/User');
const Transaction = require('../models/Transaction');
const jwt = require('jsonwebtoken');

// Generate JWT Token
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE,
    });
};

// Helper: same calendar day check
const isSameDay = (d1, d2) => {
    return d1.getFullYear() === d2.getFullYear() &&
           d1.getMonth() === d2.getMonth() &&
           d1.getDate() === d2.getDate();
};

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res) => {
    try {
        const { email, password } = req.body;

        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ success: false, message: 'User already exists' });
        }

        const user = await User.create({ email, password });
        res.status(201).json({ success: true, token: generateToken(user._id) });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ success: false, message: 'Please provide email and password' });
        }

        const user = await User.findOne({ email }).select('+password');
        if (!user) {
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }

        const isMatch = await user.matchPassword(password);
        if (!isMatch) {
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }

        res.status(200).json({ success: true, token: generateToken(user._id), onboardingComplete: user.onboardingComplete });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        const userObj = user.toObject();
        if (userObj.linkedin?.profileUrl) {
            userObj.linkedinUrl = userObj.linkedin.profileUrl;
        }
        res.status(200).json({ success: true, data: userObj });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Complete Onboarding
// @route   POST /api/auth/onboarding
// @access  Private
exports.completeOnboarding = async (req, res) => {
    try {
        let { fullName, profilePicture, collegeName, branch, graduationYear, leetcodeUsername, gfgUsername, codeforcesUsername, githubUsername, linkedin, linkedinUrl } = req.body;
        
        // Handle old frontend payload
        if (!linkedin && linkedinUrl) {
            linkedin = { profileUrl: linkedinUrl };
        }
        
        if (linkedin && linkedin.profileUrl && !linkedin.profileUrl.startsWith('http')) {
            linkedin.profileUrl = `https://www.linkedin.com/in/${linkedin.profileUrl}`;
        }
        
        // Unset old linkedinUrl field in DB
        const updateDoc = {
            fullName, profilePicture, collegeName, branch, graduationYear,
            leetcodeUsername, gfgUsername, codeforcesUsername, githubUsername,
            linkedin, onboardingComplete: true
        };
        
        const user = await User.findByIdAndUpdate(req.user.id, { $set: updateDoc, $unset: { linkedinUrl: "" } }, { new: true });

        const userObj = user.toObject();
        if (userObj.linkedin?.profileUrl) {
            userObj.linkedinUrl = userObj.linkedin.profileUrl;
        }
        res.status(200).json({ success: true, data: userObj });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Update User Profile
// @route   PUT /api/auth/profile
// @access  Private
exports.updateProfile = async (req, res) => {
    try {
        let {
            fullName, profilePicture, collegeName, branch, graduationYear,
            bio, leetcodeUsername, gfgUsername, githubUsername, codeforcesUsername, linkedin, linkedinUrl
        } = req.body;
        
        console.log("UPDATE PROFILE REQUEST:", JSON.stringify(req.body));
        
        // Handle old frontend payload
        if (!linkedin && linkedinUrl) {
            linkedin = { profileUrl: linkedinUrl };
        }
        
        if (linkedin && linkedin.profileUrl && !linkedin.profileUrl.startsWith('http')) {
            linkedin.profileUrl = `https://www.linkedin.com/in/${linkedin.profileUrl}`;
        }
        
        const updateDoc = {
            fullName, profilePicture, collegeName, branch, graduationYear,
            bio, leetcodeUsername, gfgUsername, githubUsername, codeforcesUsername, linkedin
        };
        
        const user = await User.findByIdAndUpdate(req.user.id, { $set: updateDoc, $unset: { linkedinUrl: "" } }, { new: true });

        const userObj = user.toObject();
        if (userObj.linkedin?.profileUrl) {
            userObj.linkedinUrl = userObj.linkedin.profileUrl;
        }
        res.status(200).json({ success: true, data: userObj });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Change Password
// @route   PUT /api/auth/password
// @access  Private
exports.changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        
        if (!currentPassword || !newPassword) {
            return res.status(400).json({ success: false, message: 'Please provide current and new password' });
        }
        
        const user = await User.findById(req.user.id).select('+password');
        
        const isMatch = await user.matchPassword(currentPassword);
        if (!isMatch) {
            return res.status(401).json({ success: false, message: 'Incorrect current password' });
        }
        
        user.password = newPassword;
        await user.save();
        
        res.status(200).json({ success: true, message: 'Password updated successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

