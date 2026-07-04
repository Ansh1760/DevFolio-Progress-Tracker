const mongoose = require('mongoose');

const badgeSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String, required: true },
    icon: { type: String, required: true }, // URL or icon name
    condition: { type: String }, // e.g., "50_problems", "365_streak", "array_master"
    level: { type: String, enum: ['bronze', 'silver', 'gold', 'platinum'] }
}, { timestamps: true });

module.exports = mongoose.model('Badge', badgeSchema);
