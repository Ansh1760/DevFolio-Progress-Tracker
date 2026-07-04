const DailyTracker = require('../models/DailyTracker');
const User = require('../models/User');

// Helper to check if two dates are the same day
const isSameDay = (d1, d2) => {
    return d1.getFullYear() === d2.getFullYear() &&
           d1.getMonth() === d2.getMonth() &&
           d1.getDate() === d2.getDate();
};

// @desc    Get Today's Tracker
// @route   GET /api/tracker/today
// @access  Private
exports.getTodayTracker = async (req, res) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        let tracker = await DailyTracker.findOne({
            user: req.user.id,
            date: {
                $gte: today,
                $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000)
            }
        });

        if (!tracker) {
            tracker = await DailyTracker.create({
                user: req.user.id,
                date: new Date(),
                goals: [],
                notes: ''
            });
        }

        res.status(200).json({ success: true, data: tracker });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Update Tracker (Goals, Notes)
// @route   PUT /api/tracker/:id
// @access  Private
exports.updateTracker = async (req, res) => {
    try {
        const { goals, notes } = req.body;
        
        let tracker = await DailyTracker.findById(req.params.id);
        if (!tracker || tracker.user.toString() !== req.user.id) {
            return res.status(404).json({ success: false, message: 'Tracker not found' });
        }

        tracker.goals = goals;
        tracker.notes = notes;
        await tracker.save();

        // Update streak logic if meaningful activity happened (e.g. goal completed)
        const hasCompletedGoal = goals.some(g => g.completed);
        
        if (hasCompletedGoal) {
            const user = await User.findById(req.user.id);
            const today = new Date();
            
            // Check if user was already active today
            const alreadyActiveToday = user.lastActive && isSameDay(user.lastActive, today);
            
            if (!alreadyActiveToday) {
                // If last active was yesterday, increment streak
                if (user.lastActive) {
                    const yesterday = new Date();
                    yesterday.setDate(yesterday.getDate() - 1);
                    if (isSameDay(user.lastActive, yesterday)) {
                        user.streak += 1;
                    } else {
                        user.streak = 1;
                    }
                } else {
                    user.streak = 1;
                }
                
                if (user.streak > user.longestStreak) {
                    user.longestStreak = user.streak;
                }
                
                user.lastActive = today;
                user.activityDates.push(today);
                await user.save();
            }
        }

        res.status(200).json({ success: true, data: tracker });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
