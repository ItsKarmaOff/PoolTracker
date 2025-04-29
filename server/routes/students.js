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
const { authenticateJWT, isAdmin, isAdminOrSelf } = require('../middlewares/auth');

// Routes accessible to all administrators
router.get('/', authenticateJWT, isAdmin, studentController.getAllStudents);
router.post('/', authenticateJWT, isAdmin, studentController.createStudent);

// Routes accessible by the administrator or the student themselves
router.get('/:id', authenticateJWT, isAdminOrSelf, studentController.getStudentById);

// Routes reserved for administrators
router.put('/:id', authenticateJWT, isAdmin, studentController.updateStudent);
router.delete('/:id', authenticateJWT, isAdmin, studentController.deleteStudent);

module.exports = router;
