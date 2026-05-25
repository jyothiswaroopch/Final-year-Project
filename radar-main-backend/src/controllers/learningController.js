const fs = require('fs').promises;
const path = require('path');
const logger = require('../config/logger');
const LearningProgress = require('../models/LearningProgress');

const DATA_PATH = path.join(__dirname, '../data/learningData.json');

const readCourses = async () => {
    const raw = await fs.readFile(DATA_PATH, 'utf8');
    return JSON.parse(raw);
};

// GET /api/learning  — all courses
const getLearnings = async (req, res) => {
    try {
        let courses = await readCourses();
        const audience = req.query.audience;
        if (audience) {
            courses = courses.filter(c => c.audience === audience);
        }
        res.json({ success: true, data: courses });
    } catch (error) {
        logger.error('Failed to load learning data:', error);
        res.status(500).json({ success: false, error: 'Failed to load learning data' });
    }
};

// GET /api/learning/:id  — single course
const getCourse = async (req, res) => {
    try {
        const courses = await readCourses();
        const course = courses.find(c => c.id === req.params.id);
        if (!course) return res.status(404).json({ success: false, error: 'Course not found' });
        res.json({ success: true, data: course });
    } catch (error) {
        logger.error('Failed to load course:', error);
        res.status(500).json({ success: false, error: 'Failed to load course' });
    }
};

// GET /api/learning/progress  — get all progress for authenticated user
const getProgress = async (req, res) => {
    try {
        // Support both authenticated users (JWT) and legacy userId param
        const userId = req.user?._id || req.user?.id || req.params.userId;

        if (!userId || userId === 'anonymous') {
            return res.json({ success: true, data: {} });
        }

        const records = await LearningProgress.find({ userId });

        // Transform to a map: { courseId: { chapters: { chapterId: true }, quizScore, quizPassed } }
        const progressMap = {};
        for (const record of records) {
            progressMap[record.courseId] = {
                chapters: Object.fromEntries(record.chapters || new Map()),
                quizScore: record.quizScore,
                quizPassed: record.quizPassed,
                quizSubmittedAt: record.quizSubmittedAt,
            };
        }

        res.json({ success: true, data: progressMap });
    } catch (error) {
        logger.error('Failed to get progress:', error);
        res.status(500).json({ success: false, error: 'Failed to get progress' });
    }
};

// POST /api/learning/progress  — save chapter completion
// body: { courseId, chapterId, completed }
const saveProgress = async (req, res) => {
    try {
        const userId = req.user?._id || req.user?.id || req.body.userId;
        const { courseId, chapterId, completed } = req.body;

        if (!courseId || !chapterId) {
            return res.status(400).json({ success: false, error: 'courseId and chapterId are required' });
        }

        if (!userId || userId === 'anonymous') {
            return res.json({ success: true, data: {} });
        }

        // Upsert: find the progress doc for this user+course, set the chapter
        const update = {
            $set: {
                [`chapters.${chapterId}`]: Boolean(completed),
                updatedAt: new Date(),
            },
        };

        const record = await LearningProgress.findOneAndUpdate(
            { userId, courseId },
            update,
            { upsert: true, new: true, setDefaultsOnInsert: true }
        );

        res.json({
            success: true,
            data: {
                chapters: Object.fromEntries(record.chapters || new Map()),
                quizScore: record.quizScore,
                quizPassed: record.quizPassed,
            },
        });
    } catch (error) {
        logger.error('Failed to save progress:', error);
        res.status(500).json({ success: false, error: 'Failed to save progress' });
    }
};

// POST /api/learning/quiz  — submit quiz answers, get score
// body: { courseId, answers: { questionId: selectedIndex, ... } }
const submitQuiz = async (req, res) => {
    try {
        const { courseId, answers } = req.body;
        const userId = req.user?._id || req.user?.id || req.body.userId;

        if (!courseId || !answers) {
            return res.status(400).json({ success: false, error: 'courseId and answers are required' });
        }

        const courses = await readCourses();
        const course = courses.find(c => c.id === courseId);
        if (!course) return res.status(404).json({ success: false, error: 'Course not found' });

        let correct = 0;
        const results = course.quiz.map(q => {
            const selected = answers[q.id];
            const isCorrect = selected === q.answer;
            if (isCorrect) correct++;
            return { id: q.id, correct: isCorrect, correctAnswer: q.answer, explanation: q.explanation };
        });

        const score = Math.round((correct / course.quiz.length) * 100);
        const passed = score >= 70;

        // Persist quiz score to MongoDB if user is authenticated
        if (userId && userId !== 'anonymous') {
            await LearningProgress.findOneAndUpdate(
                { userId, courseId },
                {
                    $set: {
                        quizScore: score,
                        quizPassed: passed,
                        quizSubmittedAt: new Date(),
                        updatedAt: new Date(),
                    },
                },
                { upsert: true, new: true, setDefaultsOnInsert: true }
            );
        }

        res.json({ success: true, data: { score, correct, total: course.quiz.length, passed, results } });
    } catch (error) {
        logger.error('Failed to submit quiz:', error);
        res.status(500).json({ success: false, error: 'Failed to submit quiz' });
    }
};

module.exports = { getLearnings, getCourse, getProgress, saveProgress, submitQuiz };
