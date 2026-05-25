const express = require('express');
const router = express.Router();
const { getLearnings, getCourse, getProgress, saveProgress, submitQuiz } = require('../controllers/learningController');
const { authMiddleware } = require('../middleware/authMiddleware');

router.get('/',                    getLearnings);
router.get('/progress',            authMiddleware, getProgress);          // authenticated progress fetch
router.get('/progress/:userId',    getProgress);                          // legacy route (unauthenticated fallback)
router.get('/:id',                 getCourse);
router.post('/progress',           authMiddleware, saveProgress);         // authenticated save
router.post('/quiz',               authMiddleware, submitQuiz);           // authenticated quiz submit

module.exports = router;
