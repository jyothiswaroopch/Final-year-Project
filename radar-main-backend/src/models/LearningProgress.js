const mongoose = require('mongoose');

const LearningProgressSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true,
    },
    courseId: {
        type: String,
        required: true,
    },
    chapters: {
        type: Map,
        of: Boolean,
        default: {},
    },
    quizScore: {
        type: Number,
        default: null,
    },
    quizPassed: {
        type: Boolean,
        default: false,
    },
    quizSubmittedAt: {
        type: Date,
        default: null,
    },
    updatedAt: {
        type: Date,
        default: Date.now,
    },
});

// Compound unique index: one progress doc per user per course
LearningProgressSchema.index({ userId: 1, courseId: 1 }, { unique: true });

LearningProgressSchema.pre('save', function (next) {
    this.updatedAt = new Date();
    next();
});

module.exports = mongoose.model('LearningProgress', LearningProgressSchema);
