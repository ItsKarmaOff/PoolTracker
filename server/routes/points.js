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
const { authenticateJWT, canManagePoints, isAuthorizedOrSelf } = require('../middlewares/auth');

// Routes for point management (accessible by ADMIN, APE, and AER)
router.post('/', authenticateJWT, canManagePoints, pointController.addPoints);
router.get('/summary', authenticateJWT, canManagePoints, pointController.getAllStudentsPointsSummary);

// Routes accessible by authorized staff or the student themselves
router.get('/user/:userId/history', authenticateJWT, isAuthorizedOrSelf, pointController.getPointsHistory);
router.get('/user/:userId/total', authenticateJWT, isAuthorizedOrSelf, pointController.getTotalPoints);

module.exports = router;
