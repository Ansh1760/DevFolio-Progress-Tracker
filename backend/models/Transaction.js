const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    amount: { type: Number, required: true },
    type: { type: String, enum: ['earned', 'spent'], required: true },
    reason: { type: String, required: true },
    platform: { type: String, enum: ['System', 'LeetCode', 'GeeksforGeeks', 'GitHub', 'Codeforces'], default: 'System' },
    metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
    date: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('Transaction', transactionSchema);
