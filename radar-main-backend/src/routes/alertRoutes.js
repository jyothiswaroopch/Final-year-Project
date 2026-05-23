const express = require('express');
const router = express.Router();
const { createAlert, getAlerts, deleteAlert } = require('../controllers/alertController');
const { createAlertRule, getAlertRules, testAlertRules } = require('../controllers/alertsRuleController');
const { authMiddleware } = require('../middleware/authMiddleware');
const { evaluateAlertProximity } = require('../services/alertProximityEngine');

router.use(authMiddleware);

router.post('/', createAlert);
router.get('/', getAlerts);
router.delete('/:id', deleteAlert);

router.post('/rules', createAlertRule);
router.get('/rules', getAlertRules);
router.get('/rules/test', testAlertRules);

// POST /api/alerts/proximity
// Body: { localAlerts: [...] }
// Returns stocks whose alerts are within striking range of their target price
router.post('/proximity', async (req, res) => {
    try {
        const { localAlerts = [] } = req.body || {};
        const data = await evaluateAlertProximity(localAlerts, req.user._id);
        res.json({ success: true, data });
    } catch (err) {
        console.error('Proximity endpoint error:', err);
        res.status(500).json({ success: false, error: 'Failed to evaluate alert proximity', data: [] });
    }
});

module.exports = router;

