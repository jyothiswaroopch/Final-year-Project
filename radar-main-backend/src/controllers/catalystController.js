const crypto = require('crypto');
const Catalyst = require('../models/Catalyst');

const normalizeSymbols = (arr) => (Array.isArray(arr) ? arr.map(s => String(s||'').trim().toUpperCase()).filter(Boolean) : []);

const createCatalyst = async (req, res) => {
    try {
        const { title, date, region, severity, verified, meta, sources, tags, relatedSymbols } = req.body || {};
        if (!title || !date || !severity) return res.status(400).json({ error: 'title, date and severity are required' });

        const normalizedDate = new Date(date);
        const normalizedSymbols = normalizeSymbols(relatedSymbols);

        const normalizedTitle = String(title).trim().toLowerCase();
        const dateKey = normalizedDate.toISOString().slice(0,10);
        const hash = crypto.createHash('md5').update(`${normalizedTitle}|${dateKey}|${String(region||'').toUpperCase()}`).digest('hex');

        const existing = await Catalyst.findOne({ hash }).lean();
        if (existing) return res.status(409).json({ error: 'Duplicate catalyst', existing });

        const doc = await Catalyst.create({
            title: String(title).trim(),
            date: normalizedDate,
            region: region ? String(region).trim().toUpperCase() : null,
            severity,
            verified: !!verified,
            meta: meta || {},
            sources: Array.isArray(sources) ? sources : [],
            tags: Array.isArray(tags) ? tags : [],
            relatedSymbols: normalizedSymbols,
            hash
        });

        return res.status(201).json({ success: true, data: doc });
    } catch (error) {
        console.error('createCatalyst error', error);
        return res.status(500).json({ error: 'Failed to create catalyst' });
    }
};

const listCatalysts = async (req, res) => {
    try {
        const q = {};
        const { symbol, region, severity, from, to, limit = 20, offset = 0 } = req.query || {};
        if (symbol) q.relatedSymbols = String(symbol).trim().toUpperCase();
        if (region) q.region = String(region).trim().toUpperCase();
        if (severity) q.severity = String(severity).trim().toLowerCase();
        if (from || to) q.date = {};
        if (from) q.date.$gte = new Date(from);
        if (to) q.date.$lte = new Date(to);

        const docs = await Catalyst.find(q).sort({ date: -1 }).skip(Number(offset)).limit(Math.min(100, Number(limit))).lean();
        return res.json({ success: true, data: docs });
    } catch (error) {
        console.error('listCatalysts error', error);
        return res.status(500).json({ error: 'Failed to list catalysts' });
    }
};

const verifyCatalyst = async (req, res) => {
    try {
        const id = req.params.id;
        const { verified } = req.body || {};
        const doc = await Catalyst.findByIdAndUpdate(id, { $set: { verified: !!verified } }, { new: true }).lean();
        if (!doc) return res.status(404).json({ error: 'Not found' });
        return res.json({ success: true, data: doc });
    } catch (error) {
        console.error('verifyCatalyst error', error);
        return res.status(500).json({ error: 'Failed to update catalyst' });
    }
};

module.exports = { createCatalyst, listCatalysts, verifyCatalyst };
