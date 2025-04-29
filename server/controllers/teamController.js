/**
 * ┌────────────────────────────────────────────────────────────────────────────
 * │ @author                    Christophe Vandevoir
 * ├────────────────────────────────────────────────────────────────────────────
 * │ @file           teamController.js
 * │ @path          server/controllers/teamController.js
 * │ @description   teamController implementation
 * │ @version       1.0.0
 * │
 * │ @email         christophe.vandevoir@epitech.eu
 * │ @date          2025-04-29
 * ├────────────────────────────────────────────────────────────────────────────
 * │ @copyright     (c) 2025 Christophe Vandevoir
 * └────────────────────────────────────────────────────────────────────────────
 */

const Team = require('../models/team');
const User = require('../models/user');

// Get all teams
exports.getAllTeams = async (req, res) => {
    try {
        const teams = await Team.getAll();
        res.status(200).json({ teams });
    } catch (error) {
        console.error('\x1b[31mError retrieving teams:\x1b[0m', error);
        res.status(500).json({ message: 'Server error while retrieving teams' });
    }
};

// Get all teams with their total points
exports.getAllTeamsWithPoints = async (req, res) => {
    try {
        const teamsWithPoints = await Team.getAllTeamsWithPoints();
        res.status(200).json({ teams: teamsWithPoints });
    } catch (error) {
        console.error('\x1b[31mError retrieving teams with points:\x1b[0m', error);
        res.status(500).json({ message: 'Server error while retrieving teams with points' });
    }
};

// Get a team by ID
exports.getTeamById = async (req, res) => {
    try {
        const { id } = req.params;
        const team = await Team.findById(id);

        if (!team) {
            return res.status(404).json({ message: 'Team not found' });
        }

        // Get the team's total points
        const totalPoints = await Team.getTotalPoints(id);

        // Merge team information with its total points
        const teamWithPoints = { ...team, totalPoints };

        res.status(200).json({ team: teamWithPoints });
    } catch (error) {
        console.error('\x1b[31mError retrieving team:\x1b[0m', error);
        res.status(500).json({ message: 'Server error while retrieving team' });
    }
};

// Create a new team
exports.createTeam = async (req, res) => {
    try {
        const { name, description, color } = req.body;

        if (!name) {
            return res.status(400).json({ message: 'Team name is required' });
        }

        const newTeam = await Team.create({ name, description, color });
        res.status(201).json({ message: 'Team created successfully', team: newTeam });
    } catch (error) {
        console.error('\x1b[31mError creating team:\x1b[0m', error);
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ message: 'A team with this name already exists' });
        }
        res.status(500).json({ message: 'Server error while creating team' });
    }
};

// Update an existing team
exports.updateTeam = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description, color } = req.body;

        if (!name) {
            return res.status(400).json({ message: 'Team name is required' });
        }

        const updated = await Team.update(id, { name, description, color });

        if (!updated) {
            return res.status(404).json({ message: 'Team not found' });
        }

        res.status(200).json({ message: 'Team updated successfully' });
    } catch (error) {
        console.error('\x1b[31mError updating team:\x1b[0m', error);
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ message: 'A team with this name already exists' });
        }
        res.status(500).json({ message: 'Server error while updating team' });
    }
};

// Delete a team
exports.deleteTeam = async (req, res) => {
    try {
        const { id } = req.params;
        const deleted = await Team.delete(id);

        if (!deleted) {
            return res.status(404).json({ message: 'Team not found' });
        }

        res.status(200).json({ message: 'Team deleted successfully' });
    } catch (error) {
        console.error('\x1b[31mError deleting team:\x1b[0m', error);
        res.status(500).json({ message: 'Server error while deleting team' });
    }
};

// Get all students from a team
exports.getTeamStudents = async (req, res) => {
    try {
        const { id } = req.params;

        // Check if team exists
        const team = await Team.findById(id);
        if (!team) {
            return res.status(404).json({ message: 'Team not found' });
        }

        const students = await Team.getStudents(id);
        res.status(200).json({ students });
    } catch (error) {
        console.error('\x1b[31mError retrieving students from team:\x1b[0m', error);
        res.status(500).json({ message: 'Server error while retrieving students' });
    }
};

// Get the top students of a team
exports.getTopStudents = async (req, res) => {
    try {
        const { id } = req.params;
        const limit = req.query.limit ? parseInt(req.query.limit) : 5;

        // Check if team exists
        const team = await Team.findById(id);
        if (!team) {
            return res.status(404).json({ message: 'Team not found' });
        }

        const topStudents = await User.getTopStudentsByTeam(id, limit);
        res.status(200).json({ topStudents });
    } catch (error) {
        console.error('\x1b[31mError retrieving top students:\x1b[0m', error);
        res.status(500).json({ message: 'Server error while retrieving top students' });
    }
};

// Add a student to a team
exports.addStudentToTeam = async (req, res) => {
    try {
        const { id } = req.params;
        const { userId } = req.body;

        if (!userId) {
            return res.status(400).json({ message: 'Student ID is required' });
        }

        // Check if the team exists
        const team = await Team.findById(id);
        if (!team) {
            return res.status(404).json({ message: 'Team not found' });
        }

        // Check if the user exists and is a student
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        if (user.role !== 'STUDENT') {
            return res.status(400).json({ message: 'Only students can be added to a team' });
        }

        const result = await Team.addStudent(id, userId);

        if (!result.success) {
            return res.status(400).json({ message: result.message });
        }

        res.status(200).json({ message: 'Student added to team successfully' });
    } catch (error) {
        console.error('\x1b[31mError adding student to team:\x1b[0m', error);
        res.status(500).json({ message: 'Server error while adding student to team' });
    }
};

// Remove a student from a team
exports.removeStudentFromTeam = async (req, res) => {
    try {
        const { id, userId } = req.params;

        // Check if team exists
        const team = await Team.findById(id);
        if (!team) {
            return res.status(404).json({ message: 'Team not found' });
        }

        const removed = await Team.removeStudent(id, userId);

        if (!removed) {
            return res.status(404).json({ message: 'Student not found in this team' });
        }

        res.status(200).json({ message: 'Student removed from team successfully' });
    } catch (error) {
        console.error('\x1b[31mError removing student from team:\x1b[0m', error);
        res.status(500).json({ message: 'Server error while removing student from team' });
    }
};
