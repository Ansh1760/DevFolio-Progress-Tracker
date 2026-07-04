const Transaction = require('../models/Transaction');
const User = require('../models/User');
const leetcodeService = require('../services/leetcodeService');
const gfgService = require('../services/gfgService');
const codeforcesService = require('../services/codeforcesService');

// Helper to check if two dates are the same calendar day
const isSameDay = (d1, d2) => {
    return d1.getFullYear() === d2.getFullYear() &&
           d1.getMonth() === d2.getMonth() &&
           d1.getDate() === d2.getDate();
};

// @desc    Daily Login Reward (+1 Coin & Streak tracking)
// @route   POST /api/wallet/daily-login
// @access  Private
exports.dailyLogin = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        const today = new Date();

        if (user.lastDailyReward && isSameDay(new Date(user.lastDailyReward), today)) {
            return res.status(200).json({ success: true, alreadyClaimed: true });
        }

        // Streak Logic
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        let lastActiveDay = user.lastDailyReward ? new Date(user.lastDailyReward) : null;

        if (lastActiveDay && isSameDay(lastActiveDay, yesterday)) {
            user.streak += 1;
        } else {
            user.streak = 1; // Reset or start fresh
        }

        if (user.streak > (user.longestStreak || 0)) {
            user.longestStreak = user.streak;
        }

        user.lastDailyReward = today;
        user.lastActive = today;
        
        if (!user.activityDates.some(d => isSameDay(new Date(d), today))) {
            user.activityDates.push(today);
        }

        let totalEarned = 1;
        let reasons = ['Daily Login (+1)'];

        // Streak Bonuses
        let bonus = 0;
        if (user.streak === 7) { bonus = 25; reasons.push('7 Day Streak Bonus (+25)'); }
        else if (user.streak === 30) { bonus = 100; reasons.push('30 Day Streak Bonus (+100)'); }
        else if (user.streak === 100) { bonus = 500; reasons.push('100 Day Streak Bonus (+500)'); }
        
        totalEarned += bonus;

        await Transaction.create({
            user: user._id,
            amount: totalEarned,
            type: 'earned',
            reason: reasons.join(', '),
            platform: 'System',
            metadata: { streak: user.streak, bonus }
        });

        user.coins += totalEarned;
        await user.save();

        res.status(200).json({
            success: true,
            alreadyClaimed: false,
            reward: totalEarned,
            streak: user.streak,
            totalCoins: user.coins,
            message: `🎉 +${totalEarned} DevCoins earned!`
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Platform Sync (+2 coins per new problem)
// @route   POST /api/wallet/platform-sync
// @access  Private
exports.platformSync = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        
        const [leetcode, gfg, codeforces] = await Promise.all([
            leetcodeService.getLeetCodeStats(user.leetcodeUsername),
            gfgService.getGFGStats(user.gfgUsername),
            codeforcesService.getCodeforcesStats(user.codeforcesUsername)
        ]);

        const newLeetcode  = (leetcode  && !leetcode.error  && leetcode.totalSolved  !== undefined) ? leetcode.totalSolved       : user.lastLeetcodeSolved;
        const newGfg       = (gfg       && !gfg.error       && gfg.totalSolved       !== undefined) ? gfg.totalSolved            : user.lastGfgSolved;

        const deltaLeetcode  = Math.max(0, newLeetcode   - user.lastLeetcodeSolved);
        const deltaGfg       = Math.max(0, newGfg        - user.lastGfgSolved);
        
        let totalDelta = deltaLeetcode + deltaGfg;

        // Prevent granting massive coin rewards on the very first sync
        if (!user.lastPlatformSync) {
            totalDelta = 0;
        }

        const coinsEarned = totalDelta * 2;

        user.lastLeetcodeSolved  = newLeetcode;
        user.lastGfgSolved       = newGfg;
        user.totalSolved         = newLeetcode + newGfg;
        user.lastPlatformSync    = new Date();
        user.lastSyncedAt        = new Date();

        // Also persist the scraped GFG stats to MongoDB cache so the dashboard
        // always shows fresh data after a platform sync
        if (gfg && !gfg.error && user.gfgUsername) {
            user.gfgStats = {
                totalSolved:     gfg.totalSolved     ?? user.gfgStats?.totalSolved     ?? null,
                codingScore:     gfg.codingScore     ?? user.gfgStats?.codingScore     ?? null,
                institutionRank: gfg.institutionRank ?? user.gfgStats?.institutionRank ?? null,
                profileImage:    gfg.profileImage    ?? user.gfgStats?.profileImage    ?? null,
                lastSynced:      new Date(),
                rawStats: gfg.rawStats ? {
                    school: gfg.rawStats.school ?? null,
                    basic:  gfg.rawStats.basic  ?? null,
                    easy:   gfg.rawStats.easy   ?? null,
                    medium: gfg.rawStats.medium ?? null,
                    hard:   gfg.rawStats.hard   ?? null,
                } : (user.gfgStats?.rawStats || {}),
            };
        }

        if (codeforces && !codeforces.error && user.codeforcesUsername) {
            user.codeforces = {
                username: codeforces.username ?? user.codeforces?.username,
                rating: codeforces.rating ?? user.codeforces?.rating,
                maxRating: codeforces.maxRating ?? user.codeforces?.maxRating,
                rank: codeforces.rank ?? user.codeforces?.rank,
                maxRank: codeforces.maxRank ?? user.codeforces?.maxRank,
                contribution: codeforces.contribution ?? user.codeforces?.contribution,
                friendOfCount: codeforces.friendOfCount ?? user.codeforces?.friendOfCount,
                avatar: codeforces.avatar ?? user.codeforces?.avatar,
                profileUrl: codeforces.profileUrl ?? user.codeforces?.profileUrl,
                lastSynced: new Date()
            };
        }

        if (coinsEarned > 0) {
            user.coins += coinsEarned;
            await Transaction.create({
                user: user._id,
                amount: coinsEarned,
                type: 'earned',
                reason: `Problem Solving Reward (+${totalDelta} problems)`,
                platform: 'System',
                metadata: {
                    deltaLeetcode,
                    deltaGfg
                }
            });
        }

        await user.save();

        res.status(200).json({
            success: true,
            coinsEarned,
            delta: totalDelta,
            totalCoins: user.coins
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Daily Tracker (+5 coins)
// @route   POST /api/wallet/daily-tracker
// @access  Private
exports.dailyTracker = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        const today = new Date();

        if (user.lastTrackerCompletion && isSameDay(new Date(user.lastTrackerCompletion), today)) {
            return res.status(400).json({ success: false, message: 'Daily tracker reward already claimed today.' });
        }

        user.lastTrackerCompletion = today;
        user.coins += 5;

        await Transaction.create({
            user: user._id,
            amount: 5,
            type: 'earned',
            reason: 'Daily Tracker Completed',
            platform: 'System'
        });

        await user.save();

        res.status(200).json({ success: true, reward: 5, totalCoins: user.coins });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get Transaction History
// @route   GET /api/wallet/history
// @access  Private
exports.getHistory = async (req, res) => {
    try {
        const transactions = await Transaction.find({ user: req.user.id }).sort({ date: -1 }).limit(50);
        res.status(200).json({ success: true, data: transactions });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get Wallet Balance
// @route   GET /api/wallet/balance
// @access  Private
exports.getBalance = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        
        const today = new Date();
        today.setHours(0,0,0,0);
        
        const thisWeek = new Date(today);
        thisWeek.setDate(thisWeek.getDate() - today.getDay()); // Start of week

        const transactions = await Transaction.find({ user: req.user.id, type: 'earned', date: { $gte: thisWeek } });

        const earnedToday = transactions
            .filter(t => new Date(t.date).getTime() >= today.getTime())
            .reduce((sum, t) => sum + t.amount, 0);

        const earnedThisWeek = transactions.reduce((sum, t) => sum + t.amount, 0);

        res.status(200).json({
            success: true,
            data: {
                totalCoins: user.coins,
                earnedToday,
                earnedThisWeek
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Purchase Badge (Tick)
// @route   POST /api/wallet/redeem-badge
// @access  Private
exports.purchaseBadge = async (req, res) => {
    try {
        const { badgeType } = req.body;
        const user = await User.findById(req.user.id);

        const VALID_TYPES = ['green_tick', 'blue_tick', 'profile_border', 'username_color'];

        if (!VALID_TYPES.includes(badgeType)) {
            return res.status(400).json({ success: false, message: 'Invalid store item type' });
        }

        let cost = 0;
        let itemName = '';

        if (badgeType === 'green_tick') { cost = 1999; itemName = 'Green Tick'; }
        if (badgeType === 'blue_tick') { cost = 2999; itemName = 'Blue Tick'; }
        if (badgeType === 'profile_border') { cost = 500; itemName = 'Premium Profile Border'; }
        if (badgeType === 'username_color') { cost = 500; itemName = 'Username Color'; }

        if (user.coins < cost) {
            return res.status(400).json({ success: false, message: `Insufficient coins. You need ${cost} DevCoins.` });
        }
        
        // Ensure they aren't downgrading or buying the same one
        if (badgeType === 'green_tick' || badgeType === 'blue_tick') {
            if (user.profileBadge === badgeType) {
                return res.status(400).json({ success: false, message: `You already have the ${itemName}!` });
            }
            if (user.profileBadge === 'blue_tick' && badgeType === 'green_tick') {
                return res.status(400).json({ success: false, message: 'You already have the premium Blue Tick!' });
            }
            user.profileBadge = badgeType;
        }

        if (badgeType === 'profile_border') {
            if (user.profileBorder) return res.status(400).json({ success: false, message: `You already have the ${itemName}!` });
            user.profileBorder = true;
        }

        if (badgeType === 'username_color') {
            if (user.usernameColor) return res.status(400).json({ success: false, message: `You already have the ${itemName}!` });
            user.usernameColor = true;
        }

        user.coins -= cost;
        await user.save();

        await Transaction.create({
            user: user._id,
            amount: cost,
            type: 'spent',
            reason: `Purchased ${itemName}`,
            platform: 'System'
        });

        res.status(200).json({
            success: true,
            message: `Successfully purchased ${itemName}!`,
            totalCoins: user.coins,
            profileBadge: user.profileBadge,
            profileBorder: user.profileBorder,
            usernameColor: user.usernameColor
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
