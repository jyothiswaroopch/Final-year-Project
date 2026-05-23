const express = require('express');
const router = express.Router();
const { trackSearch, getMostSearched, getTrending, getTrendingForSymbol } = require('../controllers/searchStatsController');

router.post('/track-search', trackSearch);
router.post('/track', trackSearch);
router.get('/most-searched', getMostSearched);
router.get('/trending', getTrending);
router.get('/trending/:symbol', getTrendingForSymbol);

module.exports = router;
