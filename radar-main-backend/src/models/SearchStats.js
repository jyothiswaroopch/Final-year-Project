const mongoose = require('mongoose');

const SearchStatsSchema = new mongoose.Schema({
    symbol: {
        type: String,
        required: true,
        uppercase: true,
        trim: true
    },
    category: {
        type: String,
        enum: ['trader', 'investor'],
        required: true,
        lowercase: true,
        trim: true
    },
    count: {
        type: Number,
        default: 0,
        min: 0
    },
    dailyCount: {
        type: Number,
        default: 0,
        min: 0
    },
    weeklyCount: {
        type: Number,
        default: 0,
        min: 0
    },
    dailyBucket: {
        type: String,
        default: null
    },
    weeklyBucket: {
        type: String,
        default: null
    },
    lastSearchedAt: {
        type: Date,
        default: null
    }
}, {
    timestamps: true
});

SearchStatsSchema.index({ symbol: 1, category: 1 }, { unique: true });
SearchStatsSchema.index({ category: 1, count: -1 });
SearchStatsSchema.index({ category: 1, dailyCount: -1 });
SearchStatsSchema.index({ category: 1, weeklyCount: -1 });
SearchStatsSchema.index({ lastSearchedAt: -1 });

module.exports = mongoose.model('SearchStats', SearchStatsSchema);
