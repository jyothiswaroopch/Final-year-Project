const express = require('express');
const router = express.Router();
const { runScreenerScan } = require('../controllers/screenerController');
const { createCustomFilter, getCustomFilters, deleteCustomFilter } = require('../controllers/customFilterController');
const { createSavedScreener, getSavedScreeners, deleteSavedScreener } = require('../controllers/savedScreenerController');
const { authMiddleware } = require('../middleware/authMiddleware');

// ── Screener scan ────────────────────────────────────────────
router.post('/run', authMiddleware, runScreenerScan);

// ── Custom filter metrics ─────────────────────────────────────
router.post('/filters', authMiddleware, createCustomFilter);
router.get('/filters', authMiddleware, getCustomFilters);
router.delete('/filters/:id', authMiddleware, deleteCustomFilter);

// ── Saved screener configurations ─────────────────────────────
router.post('/saved', authMiddleware, createSavedScreener);
router.get('/saved', authMiddleware, getSavedScreeners);
router.delete('/saved/:id', authMiddleware, deleteSavedScreener);

module.exports = router;
