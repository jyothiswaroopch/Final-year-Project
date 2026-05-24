const express = require('express');
const router = express.Router();
const { 
    getUserProfile,
    updateUserProfile,
    changePassword,
    saveInvestorDNA,
    updateNotificationPreferences,
    getMode, 
    updateMode,
    getUserPortfolio,
    getUserPerformance,
    getUserHoldings,
    getUserInsights,
    getUserNews,
    getUserEvents,
    getSessions,
    revokeSession,
    revokeOtherSessions,
} = require('../controllers/userController');
const { getSettings, updateSettings } = require('../controllers/settingsController');
const { authMiddleware } = require('../middleware/authMiddleware');

router.get('/profile', authMiddleware, getUserProfile);
router.patch('/profile', authMiddleware, updateUserProfile);
router.put('/password', authMiddleware, changePassword);   // change or set password
router.post('/dna', authMiddleware, saveInvestorDNA);
router.patch('/notifications', authMiddleware, updateNotificationPreferences);
router.get('/mode', authMiddleware, getMode);
router.patch('/mode', authMiddleware, updateMode);
router.get('/settings', authMiddleware, getSettings);
router.post('/settings', authMiddleware, updateSettings);

// Session management routes
router.get('/sessions', authMiddleware, getSessions);
router.delete('/sessions/others', authMiddleware, revokeOtherSessions);  // must be before /:sessionId
router.delete('/sessions/:sessionId', authMiddleware, revokeSession);

// Investor Dashboard APIs
router.get('/portfolio', authMiddleware, getUserPortfolio);
router.get('/performance', authMiddleware, getUserPerformance);
router.get('/holdings', authMiddleware, getUserHoldings);
router.get('/insights', authMiddleware, getUserInsights);
router.get('/news', authMiddleware, getUserNews);
router.get('/events', authMiddleware, getUserEvents);

module.exports = router;

