const mongoose = require('mongoose');

const CatalystSchema = new mongoose.Schema({
    title: { type: String, required: true, trim: true },
    date: { type: Date, required: true },
    region: { type: String, trim: true, uppercase: true, default: null },
    severity: { type: String, enum: ['high', 'medium', 'low'], required: true },
    verified: { type: Boolean, default: false },
    meta: { type: mongoose.Schema.Types.Mixed, default: {} },
    sources: [{ provider: String, url: String }],
    tags: [{ type: String, trim: true }],
    relatedSymbols: [{ type: String, trim: true, uppercase: true }],
    hash: { type: String, required: true, unique: true, index: true }
}, { timestamps: true });

// Indexes to support fast symbol + recent queries
CatalystSchema.index({ relatedSymbols: 1 });
CatalystSchema.index({ severity: 1, date: -1 });
CatalystSchema.index({ date: -1 });

module.exports = mongoose.model('Catalyst', CatalystSchema);
