/**
 * ┌────────────────────────────────────────────────────────────────────────────
 * │ @author                    Christophe Vandevoir
 * ├────────────────────────────────────────────────────────────────────────────
 * │ @file           studentController.js
 * │ @path          server/controllers/studentController.js
 * │ @description   studentController implementation
 * │ @version       1.0.0
 * │
 * │ @email         christophe.vandevoir@epitech.eu
 * │ @date          2025-04-29
 * ├────────────────────────────────────────────────────────────────────────────
 * │ @copyright     (c) 2025 Christophe Vandevoir
 * └────────────────────────────────────────────────────────────────────────────
 */

const User = require('../models/user');

// Get all students
exports.getAllStudents = async (req, res) => {
    try {
        const students = await User.getAllStudents();
        res.status(200).json({ students });
    } catch (error) {
        console.error('\x1b[31mError retrieving students:\x1b[0m', error);
        res.status(500).json({ message: 'Server error while retrieving students' });
    }
};

// Get a student by ID
exports.getStudentById = async (req, res) => {
    try {
        const { id } = req.params;
        const student = await User.findById(id);

        if (!student) {
            return res.status(404).json({ message: 'Student not found' });
        }

        if (student.role !== 'STUDENT') {
            return res.status(400).json({ message: 'User is not a student' });
        }

        // Exclude password from the response
        const { password, ...studentWithoutPassword } = student;

        res.status(200).json({ student: studentWithoutPassword });
    } catch (error) {
        console.error('\x1b[31mError retrieving student:\x1b[0m', error);
        res.status(500).json({ message: 'Server error while retrieving student' });
    }
};

// Create a new student
exports.createStudent = async (req, res) => {
    try {
        const { email, firstName, lastName } = req.body;

        if (!email) {
            return res.status(400).json({ message: 'Email is required' });
        }

        // Check if email is already in use
        const existingUser = await User.findByEmail(email);
        if (existingUser) {
            return res.status(400).json({ message: 'This email is already in use' });
        }

        // Create student without password (it will be set during first login)
        const newStudent = await User.create({
            email,
            firstName,
            lastName,
            role: 'STUDENT',
            isFirstLogin: true
        });

        res.status(201).json({
            message: 'Student created successfully',
            student: {
                id: newStudent.id,
                email: newStudent.email,
                firstName: newStudent.firstName,
                lastName: newStudent.lastName,
                role: newStudent.role
            }
        });
    } catch (error) {
        console.error('\x1b[31mError creating student:\x1b[0m', error);
        res.status(500).json({ message: 'Server error while creating student' });
    }
};

// Update a student
exports.updateStudent = async (req, res) => {
    try {
        const { id } = req.params;
        const { email, firstName, lastName } = req.body;

        // Check if the user exists and is a student
        const student = await User.findById(id);
        if (!student) {
            return res.status(404).json({ message: 'Student not found' });
        }
        if (student.role !== 'STUDENT') {
            return res.status(400).json({ message: 'User is not a student' });
        }

        // If the email changes, check that it's not already in use
        if (email && email !== student.email) {
            const existingUser = await User.findByEmail(email);
            if (existingUser) {
                return res.status(400).json({ message: 'This email is already in use' });
            }
        }

        // Update the student
        const updated = await User.update(id, {
            email: email || student.email,
            firstName: firstName || student.firstName,
            lastName: lastName || student.lastName
        });

        res.status(200).json({ message: 'Student updated successfully' });
    } catch (error) {
        console.error('\x1b[31mError updating student:\x1b[0m', error);
        res.status(500).json({ message: 'Server error while updating student' });
    }
};

// Delete a student
exports.deleteStudent = async (req, res) => {
    try {
        const { id } = req.params;

        // Check if the user exists and is a student
        const student = await User.findById(id);
        if (!student) {
            return res.status(404).json({ message: 'Student not found' });
        }
        if (student.role !== 'STUDENT') {
            return res.status(400).json({ message: 'User is not a student' });
        }

        // Delete the student
        const deleted = await User.delete(id);

        res.status(200).json({ message: 'Student deleted successfully' });
    } catch (error) {
        console.error('\x1b[31mError deleting student:\x1b[0m', error);
        res.status(500).json({ message: 'Server error while deleting student' });
    }
};
