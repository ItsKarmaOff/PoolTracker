/**
 * ┌────────────────────────────────────────────────────────────────────────────
 * │ @author                    Christophe Vandevoir
 * ├────────────────────────────────────────────────────────────────────────────
 * │ @file           pointController.js
 * │ @path          server/controllers/pointController.js
 * │ @description   pointController implementation
 * │ @version       1.0.0
 * │
 * │ @email         christophe.vandevoir@epitech.eu
 * │ @date          2025-04-29
 * ├────────────────────────────────────────────────────────────────────────────
 * │ @copyright     (c) 2025 Christophe Vandevoir
 * └────────────────────────────────────────────────────────────────────────────
 */

const Point = require('../models/point');
const User = require('../models/user');

// Add points to a student
exports.addPoints = async (req, res) => {
    try {
        const { userId, value, reason } = req.body;
        const adminId = req.user.id;

        if (!userId || value === undefined) {
            return res.status(400).json({ message: 'Student ID and points value are required' });
        }

        // Check if the user exists and is a student
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        if (user.role !== 'STUDENT') {
            return res.status(400).json({ message: 'Only students can receive points' });
        }

        // Add points to the student
        const points = await Point.create({ userId, value, reason, adminId });

        res.status(201).json({
            message: 'Points added successfully',
            points
        });
    } catch (error) {
        console.error("\x1b[31mError while adding points:\x1b[0m", error);
        res.status(500).json({ message: 'Server error while adding points' });
    }
};

// Get student's points history
exports.getPointsHistory = async (req, res) => {
    try {
        const { userId } = req.params;

        // Check if the user exists
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (req.user.role !== 'ADMIN' && req.user.id !== parseInt(userId)) {
            return res.status(403).json({ message: 'Unauthorized access' });
        }

        const history = await Point.getHistoryByUser(userId);
        const totalPoints = await Point.getTotalByUser(userId);

        res.status(200).json({
            history,
            totalPoints
        });
    } catch (error) {
        console.error('\x1b[31mError while retrieving points history:\x1b[0m', error);
        res.status(500).json({ message: 'Server error while retrieving points history' });
    }
};

// Get total points for a student
exports.getTotalPoints = async (req, res) => {
    try {
        const { userId } = req.params;

        // Check if the user exists
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const totalPoints = await Point.getTotalByUser(userId);

        res.status(200).json({ totalPoints });
    } catch (error) {
        console.error('\x1b[31mError calculating total points:\x1b[0m', error);
        res.status(500).json({ message: 'Server error while calculating total points' });
    }
};

// Get points summary for all students
exports.getAllStudentsPointsSummary = async (req, res) => {
    try {
        const summary = await Point.getSummaryForAllStudents();

        res.status(200).json({ summary });
    } catch (error) {
        console.error('\x1b[31mError retrieving points summary:\x1b[0m', error);
        res.status(500).json({ message: 'Server error while retrieving points summary' });
    }
};

// Get all points history across all students
exports.getAllPointsHistory = async (req, res) => {
    try {
        const history = await Point.getAllPointsHistory();

        res.status(200).json({
            history
        });
    } catch (error) {
        console.error('\x1b[31mError retrieving all points history:\x1b[0m', error);
        res.status(500).json({ message: 'Server error while retrieving points history' });
    }
};
