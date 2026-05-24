const express = require('express');
const router = express.Router();
const { getWatchlists, createWatchlist, addToWatchlist, removeFromWatchlist, getRecentChanges, getWatchlistData } = require('../controllers/watchlistController');
const { authMiddleware } = require('../middleware/authMiddleware');

// Public market-data aggregation — no auth required
router.get('/data', getWatchlistData);

router.use(authMiddleware);

router.get('/', getWatchlists);
router.post('/', createWatchlist);
router.post('/recent-changes', getRecentChanges);
router.post('/:id/add', addToWatchlist);
router.delete('/:id/remove/:symbol', removeFromWatchlist);

module.exports = router;
