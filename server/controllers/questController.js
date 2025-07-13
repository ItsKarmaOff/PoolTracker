/**
 * ┌────────────────────────────────────────────────────────────────────────────
 * │ @author                    Christophe Vandevoir
 * ├────────────────────────────────────────────────────────────────────────────
 * │ @file          questController.js
 * │ @path          server/controllers/questController.js
 * │ @description   questController implementation
 * │ @version       1.0.0
 * │
 * │ @email         christophe.vandevoir@epitech.eu
 * │ @date          2025-07-13
 * ├────────────────────────────────────────────────────────────────────────────
 * │ @copyright     (c) 2025 Christophe Vandevoir
 * └────────────────────────────────────────────────────────────────────────────
 */

const Quest = require('../models/quest');

// Get all quests (admin)
exports.getAllQuests = async (req, res) => {
    try {
        const quests = await Quest.getAll();
        res.status(200).json({ quests });
    } catch (error) {
        console.error('\x1b[31mError retrieving quests:\x1b[0m', error);
        res.status(500).json({ message: 'Server error while retrieving quests' });
    }
};

// Get quest by ID (admin)
exports.getQuestById = async (req, res) => {
    try {
        const { id } = req.params;
        const quest = await Quest.findById(id);

        if (!quest) {
            return res.status(404).json({ message: 'Quest not found' });
        }

        res.status(200).json({ quest });
    } catch (error) {
        console.error('\x1b[31mError retrieving quest:\x1b[0m', error);
        res.status(500).json({ message: 'Server error while retrieving quest' });
    }
};

// Create a new quest (admin)
exports.createQuest = async (req, res) => {
    try {
        const { name, description, secretCode, points, isActive } = req.body;

        if (!name || !secretCode || !points) {
            return res.status(400).json({ message: 'Name, secret code, and points are required' });
        }

        if (points < 1 || points > 1000) {
            return res.status(400).json({ message: 'Points must be between 1 and 1000' });
        }

        const newQuest = await Quest.create({
            name,
            description,
            secretCode,
            points: parseInt(points),
            isActive: isActive !== undefined ? isActive : true
        });

        res.status(201).json({
            message: 'Quest created successfully',
            quest: newQuest
        });
    } catch (error) {
        console.error('\x1b[31mError creating quest:\x1b[0m', error);
        res.status(500).json({ message: 'Server error while creating quest' });
    }
};

// Update a quest (admin)
exports.updateQuest = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description, secretCode, points, isActive } = req.body;

        if (!name || !secretCode || !points) {
            return res.status(400).json({ message: 'Name, secret code, and points are required' });
        }

        const updated = await Quest.update(id, {
            name,
            description,
            secretCode,
            points: parseInt(points),
            isActive
        });

        if (!updated) {
            return res.status(404).json({ message: 'Quest not found' });
        }

        res.status(200).json({ message: 'Quest updated successfully' });
    } catch (error) {
        console.error('\x1b[31mError updating quest:\x1b[0m', error);
        res.status(500).json({ message: 'Server error while updating quest' });
    }
};

// Delete a quest (admin)
exports.deleteQuest = async (req, res) => {
    try {
        const { id } = req.params;
        const deleted = await Quest.delete(id);

        if (!deleted) {
            return res.status(404).json({ message: 'Quest not found' });
        }

        res.status(200).json({ message: 'Quest deleted successfully' });
    } catch (error) {
        console.error('\x1b[31mError deleting quest:\x1b[0m', error);
        res.status(500).json({ message: 'Server error while deleting quest' });
    }
};

// Get daily quest for current user (student)
exports.getDailyQuest = async (req, res) => {
    try {
        const userId = req.user.id;
        const dailyQuest = await Quest.getDailyQuestForStudent(userId);

        if (!dailyQuest) {
            return res.status(404).json({ message: 'No quest assigned for today' });
        }

        // Don't return the secret code to the student
        const { secretCode, ...questWithoutSecret } = dailyQuest;

        res.status(200).json({ quest: questWithoutSecret });
    } catch (error) {
        console.error('\x1b[31mError retrieving daily quest:\x1b[0m', error);
        res.status(500).json({ message: 'Server error while retrieving daily quest' });
    }
};

// Submit quest code (student)
exports.submitQuestCode = async (req, res) => {
    try {
        const { questId, code } = req.body;
        const userId = req.user.id;

        if (!questId || !code) {
            return res.status(400).json({ message: 'Quest ID and code are required' });
        }

        const result = await Quest.submitQuestCode(questId, code, userId);

        if (result.success) {
            res.status(200).json({
                message: result.message,
                points: result.points,
                success: true
            });
        } else {
            res.status(400).json({
                message: result.message,
                success: false
            });
        }
    } catch (error) {
        console.error('\x1b[31mError submitting quest code:\x1b[0m', error);
        res.status(500).json({ message: 'Server error while submitting quest code' });
    }
};

// Manually assign daily quests (admin)
exports.assignDailyQuests = async (req, res) => {
    try {
        await Quest.assignDailyQuests();
        res.status(200).json({ message: 'Daily quests assigned successfully' });
    } catch (error) {
        console.error('\x1b[31mError assigning daily quests:\x1b[0m', error);
        res.status(500).json({ message: 'Server error while assigning daily quests' });
    }
};

// Get quest statistics (admin)
exports.getQuestStatistics = async (req, res) => {
    try {
        const statistics = await Quest.getStatistics();
        res.status(200).json({ statistics });
    } catch (error) {
        console.error('\x1b[31mError retrieving quest statistics:\x1b[0m', error);
        res.status(500).json({ message: 'Server error while retrieving quest statistics' });
    }
};

// Get quest configuration (admin)
exports.getQuestConfig = async (req, res) => {
    try {
        const config = await Quest.getConfig();
        res.status(200).json({ config });
    } catch (error) {
        console.error('\x1b[31mError retrieving quest config:\x1b[0m', error);
        res.status(500).json({ message: 'Server error while retrieving quest config' });
    }
};

// Update quest configuration (admin)
exports.updateQuestConfig = async (req, res) => {
    try {
        const { assignmentHour, durationHours } = req.body;

        if (assignmentHour < 0 || assignmentHour > 23) {
            return res.status(400).json({ message: 'Assignment hour must be between 0 and 23' });
        }

        if (durationHours < 1 || durationHours > 48) {
            return res.status(400).json({ message: 'Duration must be between 1 and 48 hours' });
        }

        await Quest.updateConfig({
            assignmentHour: parseInt(assignmentHour),
            durationHours: parseInt(durationHours)
        });

        res.status(200).json({ message: 'Quest configuration updated successfully' });
    } catch (error) {
        console.error('\x1b[31mError updating quest config:\x1b[0m', error);
        res.status(500).json({ message: 'Server error while updating quest config' });
    }
};
