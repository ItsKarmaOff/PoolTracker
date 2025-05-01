/**
 * ┌────────────────────────────────────────────────────────────────────────────
 * │ @author                    Christophe Vandevoir
 * ├────────────────────────────────────────────────────────────────────────────
 * │ @file           user.js
 * │ @path          server/models/user.js
 * │ @description   user implementation
 * │ @version       1.0.0
 * │
 * │ @email         christophe.vandevoir@epitech.eu
 * │ @date          2025-04-29
 * ├────────────────────────────────────────────────────────────────────────────
 * │ @copyright     (c) 2025 Christophe Vandevoir
 * └────────────────────────────────────────────────────────────────────────────
 */

const { pool } = require('../config/database');
const bcrypt = require('bcrypt');

class User {
    // Find a user by email
    static async findByEmail(email) {
        try {
            const [rows] = await pool.query('SELECT * FROM USERS WHERE email = ?', [email]);
            return rows[0];
        } catch (error) {
            console.error('\x1b[31mError finding user by email:\x1b[0m', error);
            throw error;
        }
    }

    // Find a user by ID
    static async findById(id) {
        try {
            const [rows] = await pool.query('SELECT * FROM USERS WHERE id = ?', [id]);
            return rows[0];
        } catch (error) {
            console.error('\x1b[31mError finding user by ID:\x1b[0m', error);
            throw error;
        }
    }

    // Get all users
    static async getAll() {
        try {
            const [rows] = await pool.query('SELECT * FROM USERS ORDER BY role, firstName, lastName');
            return rows;
        } catch (error) {
            console.error('\x1b[31mError retrieving all users:\x1b[0m', error);
            throw error;
        }
    }

    // Get all users by role
    static async getAllByRole(role) {
        try {
            const [rows] = await pool.query(
                'SELECT * FROM USERS WHERE role = ? ORDER BY firstName, lastName',
                [role]
            );
            return rows;
        } catch (error) {
            console.error('\x1b[31mError retrieving users by role:\x1b[0m', error);
            throw error;
        }
    }

    // Create a new user
    static async create(userData) {
        try {
            const { email, password, role, firstName, lastName, isFirstLogin = true } = userData;

            let hashedPassword = null;
            if (password) {
                hashedPassword = await bcrypt.hash(password, 10);
            }

            const [result] = await pool.query(
                'INSERT INTO USERS (email, password, role, firstName, lastName, isFirstLogin) VALUES (?, ?, ?, ?, ?, ?)',
                [email, hashedPassword, role, firstName, lastName, isFirstLogin]
            );

            return { id: result.insertId, ...userData };
        } catch (error) {
            console.error('\x1b[31mError creating user:\x1b[0m', error);
            throw error;
        }
    }

    // Update an existing user
    static async update(id, updateData) {
        try {
            const updates = [];
            const values = [];

            for (const [key, value] of Object.entries(updateData)) {
                if (key === 'password' && value) {
                    const hashedPassword = await bcrypt.hash(value, 10);
                    updates.push(`${key} = ?`);
                    values.push(hashedPassword);
                } else if (value !== undefined) {
                    updates.push(`${key} = ?`);
                    values.push(value);
                }
            }

            if (updates.length === 0) return null;

            values.push(id);

            const [result] = await pool.query(
                `UPDATE USERS SET ${updates.join(', ')} WHERE id = ?`,
                values
            );

            return result.affectedRows > 0;
        } catch (error) {
            console.error('\x1b[31mError updating user:\x1b[0m', error);
            throw error;
        }
    }

    // Delete a user
    static async delete(id) {
        try {
            const [result] = await pool.query('DELETE FROM USERS WHERE id = ?', [id]);
            return result.affectedRows > 0;
        } catch (error) {
            console.error('\x1b[31mError deleting user:\x1b[0m', error);
            throw error;
        }
    }

    // Get all students
    static async getAllStudents() {
        try {
            const [rows] = await pool.query('SELECT id, email, firstName, lastName, createdAt FROM USERS WHERE role = "STUDENT" ORDER BY lastName ASC, firstName ASC');
            return rows;
        } catch (error) {
            console.error('\x1b[31mError retrieving students:\x1b[0m', error);
            throw error;
        }
    }

    // Get top N students by team
    static async getTopStudentsByTeam(teamId, limit = 5) {
        try {
            const [rows] = await pool.query(`
                SELECT u.id, u.firstName, u.lastName, SUM(p.value) as totalPoints
                FROM USERS u
                JOIN USER_TEAMS ut ON u.id = ut.userId
                LEFT JOIN POINTS p ON u.id = p.userId
                WHERE ut.teamId = ? AND u.role = "STUDENT"
                GROUP BY u.id
                ORDER BY totalPoints DESC, u.firstName ASC, u.lastName ASC
                LIMIT ?
            `, [teamId, limit]);

            return rows;
        } catch (error) {
            console.error('Erreur lors de la récupération du top des étudiants:', error);
            throw error;
        }
    }

    // Check if a password is valid
    static async verifyPassword(plainPassword, hashedPassword) {
        return await bcrypt.compare(plainPassword, hashedPassword);
    }
}

module.exports = User;
