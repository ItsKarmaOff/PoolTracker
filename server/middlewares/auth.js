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

// Middleware to check if the user has admin privileges (ADMIN or APE)
exports.hasAdminPrivileges = (req, res, next) => {
    if (req.user && (req.user.role === 'ADMIN' || req.user.role === 'APE')) {
        next();
    } else {
        res.status(403).json({ message: 'Access denied. Administrator privileges required.' });
    }
};

// Middleware to check if the user can manage points (ADMIN, APE, or AER)
exports.canManagePoints = (req, res, next) => {
    if (req.user && (req.user.role === 'ADMIN' || req.user.role === 'APE' || req.user.role === 'AER')) {
        next();
    } else {
        res.status(403).json({ message: 'Access denied. Points management privileges required.' });
    }
};

// Middleware to check if the user can manage specific account types
exports.canManageAccountType = (accountType) => {
    return (req, res, next) => {
        // ADMIN can manage all accounts
        if (req.user && req.user.role === 'ADMIN') {
            return next();
        }

        // APE can manage AER and STUDENT accounts
        if (req.user && req.user.role === 'APE' && (accountType === 'AER' || accountType === 'STUDENT')) {
            return next();
        }

        return res.status(403).json({
            message: `Access denied. You don't have permission to manage ${accountType} accounts.`
        });
    };
};

// Middleware to check if the user is either authorized staff or the concerned student
exports.isAuthorizedOrSelf = (req, res, next) => {
    const userId = parseInt(req.params.id || req.params.userId);

    if (req.user &&
        (req.user.role === 'ADMIN' || req.user.role === 'APE' || req.user.role === 'AER' || req.user.id === userId)) {
        next();
    } else {
        res.status(403).json({ message: 'Access denied. You are not authorized to access this resource.' });
    }
};
