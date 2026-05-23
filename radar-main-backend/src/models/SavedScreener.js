const mongoose = require('mongoose');

const SavedScreenerSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    name: {
        type: String,
        required: true,
        trim: true,
        maxlength: 80,
    },
    purpose: {
        type: String,
        required: true,
        trim: true,
        maxlength: 500,
    },
    filters: {
        type: mongoose.Schema.Types.Mixed,
        default: {},
    },
    visibleFilters: {
        type: [String],
        default: [],
    },
    strategyId: {
        type: String,
        default: null,
        trim: true,
    },
}, {
    timestamps: true,
});

SavedScreenerSchema.index({ userId: 1, name: 1 }, { unique: true });
SavedScreenerSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('SavedScreener', SavedScreenerSchema);
