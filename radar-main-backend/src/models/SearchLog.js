const mongoose = require('mongoose');

const SearchLogSchema = new mongoose.Schema({
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
    source: {
        type: String,
        enum: ['search_bar', 'watchlist', 'recommendation', 'stock_page', 'unknown'],
        default: 'unknown',
        lowercase: true,
        trim: true
    },
    fingerprint: {
        type: String,
        required: true,
        trim: true
    },
    searchedAt: {
        type: Date,
        required: true,
        default: Date.now
    }
}, {
    timestamps: true
});

SearchLogSchema.index({ category: 1, searchedAt: -1 });
SearchLogSchema.index({ symbol: 1, category: 1, searchedAt: -1 });
SearchLogSchema.index({ source: 1, searchedAt: -1 });

module.exports = mongoose.model('SearchLog', SearchLogSchema);
