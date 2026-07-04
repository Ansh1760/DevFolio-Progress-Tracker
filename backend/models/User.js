const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: [true, 'Please provide an email'],
        unique: true,
        match: [
            /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
            'Please add a valid email'
        ]
    },
    password: {
        type: String,
        required: [true, 'Please add a password'],
        minlength: 6,
        select: false
    },
    fullName: { type: String },
    profilePicture: { type: String },
    collegeName: { type: String },
    branch: { type: String },
    graduationYear: { type: Number },
    bio: { type: String },
    leetcodeUsername: { type: String },
    gfgUsername: { type: String },
    githubUsername: { type: String },
    codeforcesUsername: { type: String },
    // Cached GFG profile data — populated on explicit sync, read by dashboard
    gfgStats: {
        totalSolved:     { type: Number, default: null },
        codingScore:     { type: Number, default: null },
        institutionRank: { type: Number, default: null },
        profileImage:    { type: String, default: null },
        lastSynced:      { type: Date,   default: null },
        rawStats: {
            school: { type: Number, default: null },
            basic:  { type: Number, default: null },
            easy:   { type: Number, default: null },
            medium: { type: Number, default: null },
            hard:   { type: Number, default: null },
        }
    },
    codeforces: {
        username: { type: String },
        rating: { type: Number },
        maxRating: { type: Number },
        rank: { type: String },
        maxRank: { type: String },
        contribution: { type: Number },
        friendOfCount: { type: Number },
        avatar: { type: String },
        profileUrl: { type: String },
        lastSynced: { type: Date }
    },
    linkedin: {
        profileUrl: {
            type: String,
            default: ""
        }
    },
    coins: { type: Number, default: 0 },
    streak: { type: Number, default: 0 },
    longestStreak: { type: Number, default: 0 },
    lastActive: { type: Date },
    starsReceived: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    activityDates: [{ type: Date }],
    // Cached platform solved counts for leaderboard and delta-coin calculation
    totalSolved: { type: Number, default: 0 },
    lastLeetcodeSolved: { type: Number, default: 0 },
    lastGfgSolved: { type: Number, default: 0 },
    lastSyncedAt: { type: Date },
    lastDailyReward: { type: Date },
    lastPlatformSync: { type: Date },
    lastTrackerCompletion: { type: Date },
    onboardingComplete: { type: Boolean, default: false },
    profileBadge: { type: String, enum: ['none', 'green_tick', 'blue_tick'], default: 'none' },
    profileBorder: { type: Boolean, default: false },
    usernameColor: { type: Boolean, default: false },
    role: { type: String, enum: ['user', 'admin'], default: 'user' }
}, { timestamps: true });

// Encrypt password using bcrypt
userSchema.pre('save', async function() {
    if (!this.isModified('password')) {
        return;
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

// Match user entered password to hashed password in database
userSchema.methods.matchPassword = async function(enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
