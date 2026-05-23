const SavedScreener = require('../models/SavedScreener');

const sanitizeFilters = (filters) => {
    if (!filters || typeof filters !== 'object' || Array.isArray(filters)) return {};
    return filters;
};

const sanitizeVisibleFilters = (visibleFilters) => {
    if (!Array.isArray(visibleFilters)) return [];
    return visibleFilters.map(String).map(s => s.trim()).filter(Boolean);
};

const createSavedScreener = async (req, res) => {
    try {
        const name = String(req.body?.name || '').trim();
        const purpose = String(req.body?.purpose || '').trim();

        if (!name) {
            return res.status(400).json({ success: false, message: 'Screener name is required.' });
        }

        if (!purpose) {
            return res.status(400).json({ success: false, message: 'Screener purpose is required.' });
        }

        const saved = await SavedScreener.create({
            userId: req.user._id,
            name,
            purpose,
            filters: sanitizeFilters(req.body?.filters),
            visibleFilters: sanitizeVisibleFilters(req.body?.visibleFilters),
            strategyId: req.body?.strategyId ? String(req.body.strategyId).trim() : null,
        });

        return res.status(201).json({ success: true, data: saved });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(409).json({ success: false, message: 'A screener with this name already exists.' });
        }

        return res.status(500).json({ success: false, message: error.message || 'Failed to save screener.' });
    }
};

const getSavedScreeners = async (req, res) => {
    try {
        const screeners = await SavedScreener.find({ userId: req.user._id }).sort({ createdAt: -1 });
        return res.json({ success: true, data: screeners });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message || 'Failed to fetch saved screeners.' });
    }
};

const deleteSavedScreener = async (req, res) => {
    try {
        const deleted = await SavedScreener.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
        if (!deleted) {
            return res.status(404).json({ success: false, message: 'Saved screener not found.' });
        }

        return res.json({ success: true, message: 'Saved screener deleted.' });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message || 'Failed to delete saved screener.' });
    }
};

module.exports = {
    createSavedScreener,
    getSavedScreeners,
    deleteSavedScreener,
};
