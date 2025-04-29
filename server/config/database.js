/**
 * ┌────────────────────────────────────────────────────────────────────────────
 * │ @author                    Christophe Vandevoir
 * ├────────────────────────────────────────────────────────────────────────────
 * │ @file           database.js
 * │ @path          server/config/database.js
 * │ @description   database implementation
 * │ @version       1.0.0
 * │
 * │ @email         christophe.vandevoir@epitech.eu
 * │ @date          2025-04-29
 * ├────────────────────────────────────────────────────────────────────────────
 * │ @copyright     (c) 2025 Christophe Vandevoir
 * └────────────────────────────────────────────────────────────────────────────
 */

const mysql = require('mysql2/promise');
const dotenv = require('dotenv');

dotenv.config();

// Database connection configuration
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

async function initDatabase() {
    try {
        // Create tables if they don't exist
        await pool.query(`
            CREATE TABLE IF NOT EXISTS USERS (
                id INT PRIMARY KEY AUTO_INCREMENT,
                email VARCHAR(255) UNIQUE NOT NULL,
                password VARCHAR(255),
                role ENUM('STUDENT', 'ADMIN') NOT NULL DEFAULT 'STUDENT',
                firstName VARCHAR(100),
                lastName VARCHAR(100),
                isFirstLogin BOOLEAN DEFAULT TRUE,
                createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
                updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            )
        `);

        await pool.query(`
            CREATE TABLE IF NOT EXISTS TEAMS (
            id INT PRIMARY KEY AUTO_INCREMENT,
            name VARCHAR(100) UNIQUE NOT NULL,
            description TEXT,
            color ENUM('none', 'red', 'green', 'blue', 'yellow') DEFAULT 'none',
            createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
            updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            )
        `);

        await pool.query(`
            CREATE TABLE IF NOT EXISTS POINTS (
                id INT PRIMARY KEY AUTO_INCREMENT,
                userId INT NOT NULL,
                value INT NOT NULL,
                reason TEXT,
                adminId INT NOT NULL,
                createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (userId) REFERENCES USERS(id) ON DELETE CASCADE,
                FOREIGN KEY (adminId) REFERENCES USERS(id)
            )
        `);

        await pool.query(`
            CREATE TABLE IF NOT EXISTS USER_TEAMS (
                id INT PRIMARY KEY AUTO_INCREMENT,
                userId INT NOT NULL,
                teamId INT NOT NULL,
                joinedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (userId) REFERENCES USERS(id) ON DELETE CASCADE,
                FOREIGN KEY (teamId) REFERENCES TEAMS(id) ON DELETE CASCADE,
                UNIQUE KEY user_team_unique (userId, teamId)
            )
        `);

        console.log('\x1b[32mDatabase initialized successfully\x1b[0m');

        // Check if there are any existing admin accounts
        const [admins] = await pool.query('SELECT * FROM USERS WHERE role = "ADMIN" LIMIT 1');

        // If no admin accounts exist, create a default admin account
        if (admins.length === 0) {
            const bcrypt = require('bcrypt');
            const hashedPassword = await bcrypt.hash('admin123', 10);

            await pool.query(`
                INSERT INTO USERS (email, password, role, firstName, lastName, isFirstLogin)
                VALUES (?, ?, 'ADMIN', 'Admin', 'Système', FALSE)
            `, ['admin@epitech.eu', hashedPassword]);

            console.log('\x1b[32mDefault admin account created\x1b[0m');
        }
    } catch (error) {
        console.error('\x1b[31mError initializing database:\x1b[0m', error);
        throw error;
    }
}

module.exports = {
    pool,
    initDatabase
};
