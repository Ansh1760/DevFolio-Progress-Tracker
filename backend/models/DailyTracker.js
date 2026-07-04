const mongoose = require('mongoose');

const goalSchema = new mongoose.Schema({
    text: { type: String, required: true },
    completed: { type: Boolean, default: false }
});

const dailyTrackerSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    date: { type: Date, required: true },
    goals: [goalSchema],
    notes: { type: String, default: '' }
}, { timestamps: true });

module.exports = mongoose.model('DailyTracker', dailyTrackerSchema);
