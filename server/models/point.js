/**
 * ┌────────────────────────────────────────────────────────────────────────────
 * │ @author                    Christophe Vandevoir
 * ├────────────────────────────────────────────────────────────────────────────
 * │ @file           point.js
 * │ @path          server/models/point.js
 * │ @description   point implementation
 * │ @version       1.0.0
 * │
 * │ @email         christophe.vandevoir@epitech.eu
 * │ @date          2025-04-29
 * ├────────────────────────────────────────────────────────────────────────────
 * │ @copyright     (c) 2025 Christophe Vandevoir
 * └────────────────────────────────────────────────────────────────────────────
 */

const { pool } = require('../config/database');

class Point {
    // Create a new points record
    static async create(pointData) {
        try {
            const { userId, value, reason, adminId } = pointData;

            const [result] = await pool.query(
                'INSERT INTO POINTS (userId, value, reason, adminId) VALUES (?, ?, ?, ?)',
                [userId, value, reason, adminId]
            );

            return { id: result.insertId, ...pointData };
        } catch (error) {
            console.error('\x1b[31mError while adding points:\x1b[0m', error);
            throw error;
        }
    }

    // Get the point history for a student
    static async getHistoryByUser(userId) {
        try {
            const [rows] = await pool.query(`
                SELECT p.id, p.value, p.reason, p.createdAt,
                a.firstName as adminFirstName, a.lastName as adminLastName
                FROM POINTS p
                JOIN USERS a ON p.adminId = a.id
                WHERE p.userId = ?
                ORDER BY p.createdAt DESC
            `, [userId]);

            return rows;
        } catch (error) {
            console.error('\x1b[31mError while retrieving points history:\x1b[0m', error);
            throw error;
        }
    }

    // Calculate the total points for a student
    static async getTotalByUser(userId) {
        try {
            const [rows] = await pool.query(`
                SELECT COALESCE(SUM(value), 0) as totalPoints
                FROM POINTS
                WHERE userId = ?
            `, [userId]);

            return rows[0]?.totalPoints || 0;
        } catch (error) {
            console.error('\x1b[31mError while calculating total points:\x1b[0m', error);
            throw error;
        }
    }

    // Get a summary of points for all students
    static async getSummaryForAllStudents() {
        try {
            const [rows] = await pool.query(`
                SELECT u.id, u.email, u.firstName, u.lastName,
                COALESCE(SUM(p.value), 0) as totalPoints,
                t.id as teamId, t.name as teamName
                FROM USERS u
                LEFT JOIN POINTS p ON u.id = p.userId
                LEFT JOIN USER_TEAMS ut ON u.id = ut.userId
                LEFT JOIN TEAMS t ON ut.teamId = t.id
                WHERE u.role = "STUDENT"
                GROUP BY u.id
                ORDER BY totalPoints DESC
            `);

            return rows;
        } catch (error) {
            console.error('\x1b[31mError while retrieving points summary:\x1b[0m', error);
            throw error;
        }
    }
}

module.exports = Point;
