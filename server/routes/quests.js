/**
 * ┌────────────────────────────────────────────────────────────────────────────
 * │ @author                    Christophe Vandevoir
 * ├────────────────────────────────────────────────────────────────────────────
 * │ @file          quests.js
 * │ @path          server/routes/quests.js
 * │ @description   quests implementation
 * │ @version       1.0.0
 * │
 * │ @email         christophe.vandevoir@epitech.eu
 * │ @date          2025-07-13
 * ├────────────────────────────────────────────────────────────────────────────
 * │ @copyright     (c) 2025 Christophe Vandevoir
 * └────────────────────────────────────────────────────────────────────────────
 */

const express = require('express');
const router = express.Router();
const questController = require('../controllers/questController');
const { authenticateJWT, canManagePoints } = require('../middlewares/auth');

// Routes for students - get daily quest and submit code
router.get('/daily', authenticateJWT, questController.getDailyQuest);
router.post('/submit', authenticateJWT, questController.submitQuestCode);

// Routes for administrators (ADMIN, APE, AER) - quest management
router.get('/', authenticateJWT, canManagePoints, questController.getAllQuests);
router.get('/statistics', authenticateJWT, canManagePoints, questController.getQuestStatistics);
router.get('/config', authenticateJWT, canManagePoints, questController.getQuestConfig);
router.post('/assign', authenticateJWT, canManagePoints, questController.assignDailyQuests);
router.put('/config', authenticateJWT, canManagePoints, questController.updateQuestConfig);
router.get('/:id', authenticateJWT, canManagePoints, questController.getQuestById);
router.post('/', authenticateJWT, canManagePoints, questController.createQuest);
router.put('/:id', authenticateJWT, canManagePoints, questController.updateQuest);
router.delete('/:id', authenticateJWT, canManagePoints, questController.deleteQuest);

module.exports = router;
