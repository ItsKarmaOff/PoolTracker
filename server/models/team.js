/**
 * ┌────────────────────────────────────────────────────────────────────────────
 * │ @author                    Christophe Vandevoir
 * ├────────────────────────────────────────────────────────────────────────────
 * │ @file           team.js
 * │ @path          server/models/team.js
 * │ @description   team implementation
 * │ @version       1.0.0
 * │
 * │ @email         christophe.vandevoir@epitech.eu
 * │ @date          2025-04-29
 * ├────────────────────────────────────────────────────────────────────────────
 * │ @copyright     (c) 2025 Christophe Vandevoir
 * └────────────────────────────────────────────────────────────────────────────
 */

const { pool } = require('../config/database');

class Team {
    // Find a team by ID
    static async findById(id) {
        try {
            const [rows] = await pool.query('SELECT * FROM TEAMS WHERE id = ?', [id]);
            return rows[0];
        } catch (error) {
            console.error('\x1b[31mError while searching for team by ID:\x1b[0m', error);
            throw error;
        }
    }

    // Get all teams
    static async getAll() {
        try {
            const [rows] = await pool.query('SELECT * FROM TEAMS');
            return rows;
        } catch (error) {
            console.error('\x1b[31mError retrieving teams:\x1b[0m', error);
            throw error;
        }
    }

    // Create a new team
    static async create(teamData) {
        try {
            const { name, description, color = 'none' } = teamData;

            const [result] = await pool.query(
                'INSERT INTO TEAMS (name, description, color) VALUES (?, ?, ?)',
                [name, description, color]
            );

            return { id: result.insertId, ...teamData };
        } catch (error) {
            console.error('\x1b[31mError creating team:\x1b[0m', error);
            throw error;
        }
    }

    // Update an existing team
    static async update(id, updateData) {
        try {
            const { name, description, color } = updateData;

            const [result] = await pool.query(
                'UPDATE TEAMS SET name = ?, description = ?, color = ? WHERE id = ?',
                [name, description, color, id]
            );

            return result.affectedRows > 0;
        } catch (error) {
            console.error('\x1b[31mError updating team:\x1b[0m', error);
            throw error;
        }
    }

    // Delete a team
    static async delete(id) {
        try {
            const [result] = await pool.query('DELETE FROM TEAMS WHERE id = ?', [id]);
            return result.affectedRows > 0;
        } catch (error) {
            console.error('\x1b[31mError deleting team:\x1b[0m', error);
            throw error;
        }
    }

    // Get the total points of a team
    static async getTotalPoints(id) {
        try {
            const [rows] = await pool.query(`
                SELECT COALESCE(SUM(p.value), 0) as totalPoints
                FROM TEAMS t
                JOIN USER_TEAMS ut ON t.id = ut.teamId
                LEFT JOIN POINTS p ON ut.userId = p.userId
                WHERE t.id = ?
                GROUP BY t.id
            `, [id]);

            return rows[0]?.totalPoints || 0;
        } catch (error) {
            console.error('\x1b[31mError calculating team points:\x1b[0m', error);
            throw error;
        }
    }

    // Get all teams with their total points
    static async getAllTeamsWithPoints() {
        try {
            const [rows] = await pool.query(`
                SELECT t.id, t.name, t.description, t.color, COALESCE(SUM(p.value), 0) as totalPoints
                FROM TEAMS t
                LEFT JOIN USER_TEAMS ut ON t.id = ut.teamId
                LEFT JOIN POINTS p ON ut.userId = p.userId
                GROUP BY t.id
                ORDER BY totalPoints DESC
            `);

            return rows;
        } catch (error) {
            console.error('\x1b[31mError retrieving teams with points:\x1b[0m', error);
            throw error;
        }
    }

    // Add a student to a team
    static async addStudent(teamId, userId) {
        try {
            // Check if the student is already in a team
            const [existingTeams] = await pool.query(
                'SELECT * FROM USER_TEAMS WHERE userId = ?',
                [userId]
            );

            // If the student is already in this team, do nothing
            if (existingTeams.some(team => team.teamId === parseInt(teamId))) {
                return { success: false, message: 'Student is already in this team' };
            }

            // If the student is in another team, remove them first
            if (existingTeams.length > 0) {
                await pool.query('DELETE FROM USER_TEAMS WHERE userId = ?', [userId]);
            }

            // Add the student to the new team
            await pool.query(
                'INSERT INTO USER_TEAMS (userId, teamId) VALUES (?, ?)',
                [userId, teamId]
            );

            return { success: true };
        } catch (error) {
            console.error('\x1b[31mError adding student to team:\x1b[0m', error);
            throw error;
        }
    }

    // Remove a student from a team
    static async removeStudent(teamId, userId) {
        try {
            const [result] = await pool.query(
                'DELETE FROM USER_TEAMS WHERE teamId = ? AND userId = ?',
                [teamId, userId]
            );

            return result.affectedRows > 0;
        } catch (error) {
            console.error('\x1b[31mError removing student from team:\x1b[0m', error);
            throw error;
        }
    }

    // Get all students in a team
    static async getStudents(teamId) {
        try {
            const [rows] = await pool.query(`
                SELECT u.id, u.email, u.firstName, u.lastName,
                COALESCE(SUM(p.value), 0) as totalPoints
                FROM USERS u
                JOIN USER_TEAMS ut ON u.id = ut.userId
                LEFT JOIN POINTS p ON u.id = p.userId
                WHERE ut.teamId = ? AND u.role = "STUDENT"
                GROUP BY u.id
                ORDER BY totalPoints DESC
            `, [teamId]);

            return rows;
        } catch (error) {
            console.error('\x1b[31mError retrieving students from team:\x1b[0m', error);
            throw error;
        }
    }
}

module.exports = Team;
