/**
 * ┌────────────────────────────────────────────────────────────────────────────
 * │ @author                    Christophe Vandevoir
 * ├────────────────────────────────────────────────────────────────────────────
 * │ @file           auth.js
 * │ @path          server/middlewares/auth.js
 * │ @description   auth implementation
 * │ @version       1.0.0
 * │
 * │ @email         christophe.vandevoir@epitech.eu
 * │ @date          2025-04-29
 * ├────────────────────────────────────────────────────────────────────────────
 * │ @copyright     (c) 2025 Christophe Vandevoir
 * └────────────────────────────────────────────────────────────────────────────
 */

const jwt = require('jsonwebtoken');

// Middleware to verify JWT token
exports.authenticateJWT = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return res.status(401).json({ message: 'Unauthorized access. Missing token.' });
    }

    const token = authHeader.split(' ')[1];

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ message: 'Invalid or expired token' });
        }

        req.user = user;
        next();
    });
};

// Middleware to check if the user is an administrator
exports.isAdmin = (req, res, next) => {
    if (req.user && req.user.role === 'ADMIN') {
        next();
    } else {
        res.status(403).json({ message: 'Access denied. Administrator privileges required.' });
    }
};

// Middleware to check if the user is either an admin or the concerned student
exports.isAdminOrSelf = (req, res, next) => {
    const userId = parseInt(req.params.id || req.params.userId);

    if (req.user && (req.user.role === 'ADMIN' || req.user.id === userId)) {
        next();
    } else {
        res.status(403).json({ message: 'Access denied. You are not authorized to access this resource.' });
    }
};
