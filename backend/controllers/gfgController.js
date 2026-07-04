const User = require('../models/User');
const { scrapeGFGProfile } = require('../services/gfgService');

/**
 * @desc    Sync GFG profile — scrapes live data, saves to MongoDB, returns stats
 * @route   POST /api/user/sync-gfg
 * @access  Private
 */
exports.syncGfg = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        if (!user.gfgUsername) {
            return res.status(400).json({ success: false, message: 'No GeeksforGeeks username set. Please update your profile first.' });
        }

        const scraped = await scrapeGFGProfile(user.gfgUsername);

        if (!scraped || scraped.error) {
            return res.status(502).json({
                success: false,
                message: scraped?.message || 'Unable to fetch GeeksforGeeks data.'
            });
        }

        // Persist to MongoDB
        user.gfgStats = {
            totalSolved:     scraped.totalSolved     ?? user.gfgStats?.totalSolved     ?? null,
            codingScore:     scraped.codingScore     ?? user.gfgStats?.codingScore     ?? null,
            institutionRank: scraped.institutionRank ?? user.gfgStats?.institutionRank ?? null,
            profileImage:    scraped.profileImage    ?? user.gfgStats?.profileImage    ?? null,
            lastSynced:      new Date(),
            rawStats: scraped.rawStats ? {
                school: scraped.rawStats.school ?? null,
                basic:  scraped.rawStats.basic  ?? null,
                easy:   scraped.rawStats.easy   ?? null,
                medium: scraped.rawStats.medium ?? null,
                hard:   scraped.rawStats.hard   ?? null,
            } : (user.gfgStats?.rawStats || {}),
        };

        // Also keep the flat `lastGfgSolved` in sync for wallet delta calculations
        if (scraped.totalSolved !== null) {
            user.lastGfgSolved = scraped.totalSolved;
        }

        await user.save();

        return res.status(200).json({
            success: true,
            data: {
                username:        user.gfgUsername,
                totalSolved:     user.gfgStats.totalSolved,
                codingScore:     user.gfgStats.codingScore,
                institutionRank: user.gfgStats.institutionRank,
                profileImage:    user.gfgStats.profileImage,
                lastSynced:      user.gfgStats.lastSynced,
                rawStats:        user.gfgStats.rawStats,
            }
        });

    } catch (error) {
        console.error('[syncGfg] Error:', error.message);
        res.status(500).json({ success: false, message: 'Unable to fetch GeeksforGeeks data.' });
    }
};
