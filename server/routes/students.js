/**
 * ┌────────────────────────────────────────────────────────────────────────────
 * │ @author                    Christophe Vandevoir
 * ├────────────────────────────────────────────────────────────────────────────
 * │ @file           students.js
 * │ @path          server/routes/students.js
 * │ @description   students implementation
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
const studentController = require('../controllers/studentController');
const { authenticateJWT, hasAdminPrivileges, isAuthorizedOrSelf, canManageAccountType } = require('../middlewares/auth');

// Routes accessible to all administrators (ADMIN and APE)
router.get('/', authenticateJWT, hasAdminPrivileges, studentController.getAllStudents);

// Creating STUDENT accounts - open to ADMIN and APE
router.post('/', authenticateJWT, canManageAccountType('STUDENT'), studentController.createStudent);

// Routes accessible by authorized staff or the student themselves
router.get('/:id', authenticateJWT, isAuthorizedOrSelf, studentController.getStudentById);

// Routes reserved for administrators with appropriate permissions
router.put('/:id', authenticateJWT, hasAdminPrivileges, studentController.updateStudent);
router.delete('/:id', authenticateJWT, canManageAccountType('STUDENT'), studentController.deleteStudent);

module.exports = router;
