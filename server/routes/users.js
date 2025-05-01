/**
 * ┌────────────────────────────────────────────────────────────────────────────
 * │ @author                    Christophe Vandevoir
 * ├────────────────────────────────────────────────────────────────────────────
 * │ @file           users.js
 * │ @path          server/routes/users.js
 * │ @description   users implementation
 * │ @version       1.0.0
 * │
 * │ @email         christophe.vandevoir@epitech.eu
 * │ @date          2025-05-01
 * ├────────────────────────────────────────────────────────────────────────────
 * │ @copyright     (c) 2025 Christophe Vandevoir
 * └────────────────────────────────────────────────────────────────────────────
 */

const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticateJWT, isAdmin, hasAdminPrivileges, canManageAccountType } = require('../middlewares/auth');

// Get all users - visible to ADMIN and APE
router.get('/', authenticateJWT, hasAdminPrivileges, userController.getAllUsers);

// ADMIN account management - only ADMIN can create/modify/delete
router.post('/admin', authenticateJWT, isAdmin, userController.createAdmin);
router.put('/admin/:id', authenticateJWT, isAdmin, userController.updateAdmin);
router.delete('/admin/:id', authenticateJWT, isAdmin, userController.deleteAdmin);

// APE account management - only ADMIN can create/modify/delete
router.post('/ape', authenticateJWT, isAdmin, userController.createAPE);
router.put('/ape/:id', authenticateJWT, isAdmin, userController.updateAPE);
router.delete('/ape/:id', authenticateJWT, isAdmin, userController.deleteAPE);

// AER account management - ADMIN and APE can create/modify/delete
router.post('/aer', authenticateJWT, canManageAccountType('AER'), userController.createAER);
router.put('/aer/:id', authenticateJWT, canManageAccountType('AER'), userController.updateAER);
router.delete('/aer/:id', authenticateJWT, canManageAccountType('AER'), userController.deleteAER);

// Generic user update route - for updating any user including their role (admin only)
router.put('/:id', authenticateJWT, hasAdminPrivileges, userController.updateUser);

// Get users by role
router.get('/by-role/:role', authenticateJWT, hasAdminPrivileges, userController.getUsersByRole);

module.exports = router;
