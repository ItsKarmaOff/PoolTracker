/**
 * ┌────────────────────────────────────────────────────────────────────────────
 * │ @author                    Christophe Vandevoir
 * ├────────────────────────────────────────────────────────────────────────────
 * │ @file           points.js
 * │ @path          server/routes/points.js
 * │ @description   points implementation
 * │ @version       1.0.0
 * │
 * │ @email         christophe.vandevoir@epitech.eu
 * │ @date          2025-04-29
 * ├────────────────────────────────────────────────────────────────────────────
 * │ @copyright     (c) 2025 Christophe Vandevoir
 * └────────────────────────────────────────────────────────────────────────────
 */

const express = require('express');
const router = express.Router();
const pointController = require('../controllers/pointController');
const { authenticateJWT, isAdmin, isAdminOrSelf } = require('../middlewares/auth');

// Routes reserved for administrators
router.post('/', authenticateJWT, isAdmin, pointController.addPoints);
router.get('/summary', authenticateJWT, isAdmin, pointController.getAllStudentsPointsSummary);

// Routes accessible by administrator or the student themselves
router.get('/user/:userId/history', authenticateJWT, isAdminOrSelf, pointController.getPointsHistory);
router.get('/user/:userId/total', authenticateJWT, isAdminOrSelf, pointController.getTotalPoints);

module.exports = router;
