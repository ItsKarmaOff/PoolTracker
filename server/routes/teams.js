/**
 * ┌────────────────────────────────────────────────────────────────────────────
 * │ @author                    Christophe Vandevoir
 * ├────────────────────────────────────────────────────────────────────────────
 * │ @file           teams.js
 * │ @path          server/routes/teams.js
 * │ @description   teams implementation
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
const teamController = require('../controllers/teamController');
const { authenticateJWT, isAdmin } = require('../middlewares/auth');

// Routes accessible by all authenticated users
router.get('/', authenticateJWT, teamController.getAllTeams);
router.get('/with-points', authenticateJWT, teamController.getAllTeamsWithPoints);
router.get('/:id', authenticateJWT, teamController.getTeamById);
router.get('/:id/students', authenticateJWT, teamController.getTeamStudents);
router.get('/:id/top-students', authenticateJWT, teamController.getTopStudents);

// Routes reserved for administrators
router.post('/', authenticateJWT, isAdmin, teamController.createTeam);
router.put('/:id', authenticateJWT, isAdmin, teamController.updateTeam);
router.delete('/:id', authenticateJWT, isAdmin, teamController.deleteTeam);
router.post('/:id/students', authenticateJWT, isAdmin, teamController.addStudentToTeam);
router.delete('/:id/students/:userId', authenticateJWT, isAdmin, teamController.removeStudentFromTeam);

module.exports = router;
