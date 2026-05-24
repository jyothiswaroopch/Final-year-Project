const jwt = require('jsonwebtoken');
const User = require('../models/User');

const getOrCreateDevUser = async () => {
    let u = await User.findOne();
    if (!u) {
        const dummy = new User({
            username: 'devuser',
            email: 'dev@radar.com',
            password: 'password123',
            preferredMode: 'INVESTOR'
        });
        await dummy.save();
        u = dummy;
    }
    return u;
};

const authMiddleware = async (req, res, next) => {
    let token;
    const isBypassEnabled = process.env.DEV_BYPASS_AUTH === 'true';

    // Extract token from Authorization header or legacy x-auth-token
    if (req.headers.authorization?.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    } else if (req.headers['x-auth-token']) {
        token = req.headers['x-auth-token'];
    }

    if (!token) {
        if (isBypassEnabled) {
            req.user = await getOrCreateDevUser();
            if (req.user) return next();
        }
        return res.status(401).json({ error: 'Not authorized, no token' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id);

        if (!user) {
            if (isBypassEnabled) {
                req.user = await getOrCreateDevUser();
                return next();
            }
            return res.status(401).json({ error: 'Not authorized, user not found' });
        }

        // Session validation — only enforced when the JWT carries a sessionId.
        // Old tokens without sessionId are allowed through for backward compatibility.
        if (decoded.sessionId) {
            const sessionExists = user.sessions?.some(s => s.sessionId === decoded.sessionId);
            if (!sessionExists) {
                return res.status(401).json({ error: 'Session expired or revoked. Please log in again.' });
            }
            // Attach sessionId to request so controllers can reference it
            req.sessionId = decoded.sessionId;
            // Update lastActive in background — don't block the request
            User.updateOne(
                { _id: user._id, 'sessions.sessionId': decoded.sessionId },
                { $set: { 'sessions.$.lastActive': new Date() } }
            ).catch(() => {});
        }

        req.user = user;
        next();
    } catch (error) {
        if (isBypassEnabled) {
            req.user = await getOrCreateDevUser();
            return next();
        }
        const reason = error?.name === 'JsonWebTokenError' ? 'invalid signature' : error?.message || 'unknown';
        console.warn(`[auth] Token rejected (${reason}) — client should re-login`);
        res.status(401).json({ error: 'Not authorized, token failed' });
    }
};

module.exports = { authMiddleware };
