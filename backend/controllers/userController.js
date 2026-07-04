const User = require('../models/User');
const Transaction = require('../models/Transaction');
const leetcodeService = require('../services/leetcodeService');
const gfgService = require('../services/gfgService');
const githubService = require('../services/githubService');
const codeforcesService = require('../services/codeforcesService');
const Notification = require('../models/Notification');

// @desc    Get Dashboard Data
// @route   GET /api/user/dashboard
// @access  Private
exports.getDashboardData = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        // Fetch live stats from LeetCode, GitHub, Codeforces, and GFG in parallel
        const [leetcode, github, codeforces, scrapedGfg] = await Promise.all([
            leetcodeService.getLeetCodeStats(user.leetcodeUsername),
            githubService.getGitHubStats(user.githubUsername),
            codeforcesService.getCodeforcesStats(user.codeforcesUsername),
            user.gfgUsername ? gfgService.scrapeGFGProfile(user.gfgUsername) : Promise.resolve(null)
        ]);

        let gfg = null;
        if (user.gfgUsername) {
            if (scrapedGfg && !scrapedGfg.error) {
                gfg = {
                    username: user.gfgUsername,
                    ...scrapedGfg,
                    lastSynced: new Date()
                };
                
                // Silently update cache
                user.gfgStats = {
                    ...scrapedGfg,
                    lastSynced: new Date()
                };
                // We'll save the user asynchronously to not block the request
                user.save().catch(err => console.error('Failed to update GFG cache:', err));
            } else {
                // If scrape fails, try to use cache
                if (user.gfgStats && user.gfgStats.lastSynced) {
                    gfg = {
                        username: user.gfgUsername,
                        ...user.gfgStats.toObject(),
                        error: false // Ignore the scrape error since we have cache
                    };
                } else {
                    gfg = { error: true, message: scrapedGfg?.message, username: user.gfgUsername };
                }
            }
        }

        // Calculate total solved across platforms and award coins for new problems
        let newLeetcode = user.lastLeetcodeSolved || 0;
        let newGfg = user.lastGfgSolved || 0;

        if (leetcode && !leetcode.error && leetcode.totalSolved !== undefined) {
            newLeetcode = leetcode.totalSolved;
        }
        if (gfg && !gfg.error && !gfg.notSynced && gfg.totalSolved !== undefined) {
            newGfg = gfg.totalSolved;
        }

        const deltaLeetcode = Math.max(0, newLeetcode - (user.lastLeetcodeSolved || 0));
        const deltaGfg = Math.max(0, newGfg - (user.lastGfgSolved || 0));
        const totalDelta = deltaLeetcode + deltaGfg;
        const newTotalSolved = newLeetcode + newGfg;

        let totalSolved = user.totalSolved || 0;


        
        if (totalDelta > 0) {
            const coinsEarned = totalDelta * 2;
            user.coins = (user.coins || 0) + coinsEarned;
            user.lastLeetcodeSolved = newLeetcode;
            user.lastGfgSolved = newGfg;
            user.totalSolved = newLeetcode + newGfg;
            totalSolved = user.totalSolved;

            try {
                await Transaction.create({
                    user: user._id,
                    amount: coinsEarned,
                    type: 'earned',
                    reason: `Problem Solving Reward (+${totalDelta} problems)`,
                    platform: 'System',
                    metadata: { deltaLeetcode, deltaGfg }
                });
                await user.save();
            } catch (err) {
                console.error('Failed to save auto-fetch coins:', err);
            }
        } else {
            totalSolved = newLeetcode + newGfg;
        }

        // Rank based on totalSolved stored in DB
        const countHigher = await User.countDocuments({ totalSolved: { $gt: user.totalSolved } });
        const rank = countHigher + 1;
        const totalUsers = await User.countDocuments();

        let rankTier = 'Beginner';
        const percentile = totalUsers > 0 ? ((totalUsers - rank) / totalUsers) * 100 : 0;
        if (percentile >= 90) rankTier = 'Guardian';
        else if (percentile >= 70) rankTier = 'Knight';
        else if (percentile >= 50) rankTier = 'Specialist';
        else if (percentile >= 20) rankTier = 'Apprentice';

        res.status(200).json({
            success: true,
            data: {
                stats: {
                    totalSolved,
                    rank: rankTier,
                    rankNumber: rank,
                    streak: user.streak,
                    longestStreak: user.longestStreak,
                    coins: user.coins,
                    starsCount: user.starsReceived?.length || 0
                },
                leetcode: (() => { console.log('Returning leetcode in getDashboard:', leetcode); return leetcode; })(),
                gfg,
                github,
                codeforces,
                activityDates: user.activityDates || []
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};


// @desc    Get Leaderboard (sorted by totalSolved DESC, then streak, then coins)
// @route   GET /api/user/leaderboard
// @access  Private
exports.getLeaderboard = async (req, res) => {
    try {
        const { filter } = req.query;
        let query = {};

        if (filter === 'college' && req.user.collegeName) {
            query.collegeName = new RegExp('^' + req.user.collegeName + '$', 'i');
        }

        const users = await User.find(query)
            .select('fullName profilePicture profileBadge profileBorder usernameColor collegeName streak coins totalSolved leetcodeUsername gfgUsername linkedinUrl starsReceived')
            .sort({ coins: -1, totalSolved: -1, streak: -1 })
            .limit(100);

        const leaderboard = users.map((u, index) => ({
            rank: index + 1,
            id: u._id,
            name: u.fullName || 'Anonymous Coder',
            profileBadge: u.profileBadge || 'none',
            profileBorder: u.profileBorder || false,
            usernameColor: u.usernameColor || false,
            college: u.collegeName || 'Unknown',
            streak: u.streak,
            coins: u.coins,
            solved: u.totalSolved || 0,
            starsCount: u.starsReceived?.length || 0,
            avatar: u.profilePicture || `https://ui-avatars.com/api/?name=${encodeURIComponent(u.fullName || 'User')}&background=BA1200&color=fff`
        }));

        res.status(200).json({ success: true, data: leaderboard });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Search Users by name, college, username
// @route   GET /api/user/search?q=query
// @access  Private
exports.searchUsers = async (req, res) => {
    try {
        const { q } = req.query;
        if (!q || q.trim().length < 2) {
            return res.status(400).json({ success: false, message: 'Query must be at least 2 characters' });
        }

        const regex = new RegExp(q.trim(), 'i');

        const users = await User.find({
            onboardingComplete: true,
            $or: [
                { fullName: regex },
                { collegeName: regex },
                { leetcodeUsername: regex },
                { gfgUsername: regex },
                { githubUsername: regex }
            ]
        })
        .select('fullName profilePicture profileBadge profileBorder usernameColor collegeName branch leetcodeUsername gfgUsername githubUsername totalSolved streak coins')
        .limit(20);

        const results = users.map(u => ({
            id: u._id,
            name: u.fullName || 'Anonymous Coder',
            profileBadge: u.profileBadge || 'none',
            profileBorder: u.profileBorder || false,
            usernameColor: u.usernameColor || false,
            college: u.collegeName || '',
            branch: u.branch || '',
            avatar: u.profilePicture || `https://ui-avatars.com/api/?name=${encodeURIComponent(u.fullName || 'User')}&background=BA1200&color=fff`,
            leetcodeUsername: u.leetcodeUsername,
            githubUsername: u.githubUsername,
            totalSolved: u.totalSolved || 0,
            streak: u.streak || 0,
            coins: u.coins || 0
        }));

        res.status(200).json({ success: true, data: results });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get Public Profile of any user (safe fields only)
// @route   GET /api/user/profile/:id
// @access  Private
exports.getPublicProfile = async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select(
            'fullName profilePicture profileBadge profileBorder usernameColor collegeName branch graduationYear bio ' +
            'leetcodeUsername gfgUsername githubUsername codeforcesUsername linkedin ' +
            'streak longestStreak coins totalSolved activityDates lastSyncedAt createdAt gfgStats codeforces'
        );

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        // Fetch live platform stats
        const [leetcode, github, codeforces, scrapedGfg] = await Promise.all([
            leetcodeService.getLeetCodeStats(user.leetcodeUsername),
            githubService.getGitHubStats(user.githubUsername),
            codeforcesService.getCodeforcesStats(user.codeforcesUsername),
            user.gfgUsername ? gfgService.scrapeGFGProfile(user.gfgUsername) : Promise.resolve(null)
        ]);

        let gfg = null;
        if (user.gfgUsername) {
            if (scrapedGfg && !scrapedGfg.error) {
                gfg = {
                    username: user.gfgUsername,
                    ...scrapedGfg,
                    lastSynced: new Date()
                };
            } else {
                // If scrape fails, try to use cache
                if (user.gfgStats && user.gfgStats.lastSynced) {
                    gfg = {
                        username: user.gfgUsername,
                        ...user.gfgStats.toObject()
                    };
                } else {
                    gfg = { error: true, message: scrapedGfg?.message, username: user.gfgUsername };
                }
            }
        }

        res.status(200).json({
            success: true,
            data: {
                profile: {
                    ...user.toObject(),
                    starsCount: user.starsReceived?.length || 0,
                    hasStarred: user.starsReceived?.includes(req.user.id)
                },
                leetcode,
                gfg,
                github,
                codeforces
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Toggle Star on a user's profile
// @route   POST /api/user/star/:id
// @access  Private
exports.toggleStar = async (req, res) => {
    try {
        const targetUserId = req.params.id;
        const currentUserId = req.user.id;

        if (targetUserId === currentUserId) {
            return res.status(400).json({ success: false, message: "You cannot star your own profile" });
        }

        const targetUser = await User.findById(targetUserId);
        if (!targetUser) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        const hasStarred = targetUser.starsReceived.some(id => id.toString() === currentUserId.toString());

        if (hasStarred) {
            targetUser.starsReceived = targetUser.starsReceived.filter(id => id.toString() !== currentUserId.toString());
        } else {
            targetUser.starsReceived.push(currentUserId);
        }

        await targetUser.save();

        res.status(200).json({
            success: true,
            message: hasStarred ? 'Star removed' : 'Profile starred',
            starsCount: targetUser.starsReceived.length,
            hasStarred: !hasStarred
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get Global Notifications
// @route   GET /api/user/notifications
// @access  Private
exports.getNotifications = async (req, res) => {
    try {
        const notifications = await Notification.find({ isGlobal: true }).sort({ createdAt: -1 });
        res.status(200).json({ success: true, data: notifications });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    SSE endpoint for real-time notifications
// @route   GET /api/user/notifications/stream
// @access  Private
exports.notificationStream = (req, res) => {
    const { addClient, removeClient } = require('../utils/sse');
    
    // Set headers for SSE
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    
    addClient(res);
    
    // Send initial connection success message
    res.write(`data: ${JSON.stringify({ type: 'connected', message: 'SSE Connection Established' })}\n\n`);
    
    // Clean up when client closes connection
    req.on('close', () => {
        removeClient(res);
    });
};
