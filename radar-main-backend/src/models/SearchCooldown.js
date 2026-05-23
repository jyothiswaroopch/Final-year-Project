const mongoose = require('mongoose');

const SearchCooldownSchema = new mongoose.Schema({
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
    fingerprint: {
        type: String,
        required: true,
        trim: true
    },
    lastTrackedAt: {
        type: Date,
        required: true,
        default: Date.now
    },
    expiresAt: {
        type: Date,
        required: true
    }
}, {
    timestamps: true
});

SearchCooldownSchema.index({ symbol: 1, category: 1, fingerprint: 1 }, { unique: true });
SearchCooldownSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model('SearchCooldown', SearchCooldownSchema);
