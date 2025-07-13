/**
 * ┌────────────────────────────────────────────────────────────────────────────
 * │ @author                    Christophe Vandevoir
 * ├────────────────────────────────────────────────────────────────────────────
 * │ @file          quest.js
 * │ @path          server/models/quest.js
 * │ @description   Quest implementation
 * │ @version       1.0.0
 * │
 * │ @email         christophe.vandevoir@epitech.eu
 * │ @date          2025-07-12
 * ├────────────────────────────────────────────────────────────────────────────
 * │ @copyright     (c) 2025 Christophe Vandevoir
 * └────────────────────────────────────────────────────────────────────────────
 */

const { pool } = require('../config/database');

class Quest {
    // Find a quest by ID
    static async findById(id) {
        try {
            const [rows] = await pool.query('SELECT * FROM QUESTS WHERE id = ?', [id]);
            return rows[0];
        } catch (error) {
            console.error('\x1b[31mError finding quest by ID:\x1b[0m', error);
            throw error;
        }
    }

    // Get all quests
    static async getAll() {
        try {
            const [rows] = await pool.query('SELECT * FROM QUESTS ORDER BY name ASC');
            return rows;
        } catch (error) {
            console.error('\x1b[31mError retrieving quests:\x1b[0m', error);
            throw error;
        }
    }

    // Get all active quests
    static async getAllActive() {
        try {
            const [rows] = await pool.query('SELECT * FROM QUESTS WHERE isActive = TRUE ORDER BY name ASC');
            return rows;
        } catch (error) {
            console.error('\x1b[31mError retrieving active quests:\x1b[0m', error);
            throw error;
        }
    }

    // Create a new quest
    static async create(questData) {
        try {
            const { name, description, secretCode, points, isActive = true } = questData;

            const [result] = await pool.query(
                'INSERT INTO QUESTS (name, description, secretCode, points, isActive) VALUES (?, ?, ?, ?, ?)',
                [name, description, secretCode, points, isActive]
            );

            return { id: result.insertId, ...questData };
        } catch (error) {
            console.error('\x1b[31mError creating quest:\x1b[0m', error);
            throw error;
        }
    }

    // Update an existing quest
    static async update(id, updateData) {
        try {
            const { name, description, secretCode, points, isActive } = updateData;

            const [result] = await pool.query(
                'UPDATE QUESTS SET name = ?, description = ?, secretCode = ?, points = ?, isActive = ? WHERE id = ?',
                [name, description, secretCode, points, isActive, id]
            );

            return result.affectedRows > 0;
        } catch (error) {
            console.error('\x1b[31mError updating quest:\x1b[0m', error);
            throw error;
        }
    }

    // Delete a quest
    static async delete(id) {
        try {
            const [result] = await pool.query('DELETE FROM QUESTS WHERE id = ?', [id]);
            return result.affectedRows > 0;
        } catch (error) {
            console.error('\x1b[31mError deleting quest:\x1b[0m', error);
            throw error;
        }
    }

    // Assign daily quests to all students
    static async assignDailyQuests() {
        try {
            const connection = await pool.getConnection();
            await connection.beginTransaction();

            try {
                // Get all active students
                const [students] = await connection.query(
                    'SELECT id FROM USERS WHERE role = "STUDENT"'
                );

                // Get all active quests
                const [quests] = await connection.query(
                    'SELECT id FROM QUESTS WHERE isActive = TRUE'
                );

                if (quests.length === 0) {
                    console.log('No active quests available for assignment');
                    await connection.rollback();
                    connection.release();
                    return;
                }

                // Get quest configuration
                const [config] = await connection.query(
                    'SELECT durationHours FROM QUEST_CONFIG LIMIT 1'
                );
                const durationHours = config[0]?.durationHours || 24;

                const today = new Date().toISOString().split('T')[0];
                const expiresAt = new Date();
                expiresAt.setHours(expiresAt.getHours() + durationHours);

                // Assign random quest to each student
                for (const student of students) {
                    // Check if student already has a quest for today
                    const [existing] = await connection.query(
                        'SELECT id FROM DAILY_QUESTS WHERE userId = ? AND assignedDate = ?',
                        [student.id, today]
                    );

                    if (existing.length === 0) {
                        // Pick a random quest
                        const randomQuest = quests[Math.floor(Math.random() * quests.length)];

                        await connection.query(
                            'INSERT INTO DAILY_QUESTS (userId, questId, assignedDate, expiresAt) VALUES (?, ?, ?, ?)',
                            [student.id, randomQuest.id, today, expiresAt]
                        );
                    }
                }

                await connection.commit();
                console.log(`Daily quests assigned to ${students.length} students`);
            } catch (error) {
                await connection.rollback();
                throw error;
            } finally {
                connection.release();
            }
        } catch (error) {
            console.error('\x1b[31mError assigning daily quests:\x1b[0m', error);
            throw error;
        }
    }

    // Get daily quest for a student
    static async getDailyQuestForStudent(userId, date = null) {
        try {
            const questDate = date || new Date().toISOString().split('T')[0];

            const [rows] = await pool.query(`
                SELECT dq.*, q.name, q.description, q.points
                FROM DAILY_QUESTS dq
                JOIN QUESTS q ON dq.questId = q.id
                WHERE dq.userId = ? AND dq.assignedDate = ?
            `, [userId, questDate]);

            return rows[0];
        } catch (error) {
            console.error('\x1b[31mError retrieving daily quest for student:\x1b[0m', error);
            throw error;
        }
    }

    // Submit quest code
    static async submitQuestCode(dailyQuestId, submittedCode, userId) {
        try {
            const connection = await pool.getConnection();
            await connection.beginTransaction();

            try {
                // Get the daily quest with quest details
                const [dailyQuest] = await connection.query(`
                    SELECT dq.*, q.secretCode, q.points
                    FROM DAILY_QUESTS dq
                    JOIN QUESTS q ON dq.questId = q.id
                    WHERE dq.id = ? AND dq.userId = ?
                `, [dailyQuestId, userId]);

                if (!dailyQuest[0]) {
                    await connection.rollback();
                    connection.release();
                    return { success: false, message: 'Quest not found' };
                }

                const quest = dailyQuest[0];

                // Check if quest is already completed
                if (quest.isCompleted) {
                    await connection.rollback();
                    connection.release();
                    return { success: false, message: 'Quest already completed' };
                }

                // Check if quest has expired
                if (new Date() > new Date(quest.expiresAt)) {
                    await connection.rollback();
                    connection.release();
                    return { success: false, message: 'Quest has expired' };
                }

                // Check if code is correct
                const isSuccessful = submittedCode === quest.secretCode;

                // Log the submission
                await connection.query(
                    'INSERT INTO QUEST_SUBMISSIONS (dailyQuestId, submittedCode, isSuccessful) VALUES (?, ?, ?)',
                    [dailyQuestId, submittedCode, isSuccessful]
                );

                if (isSuccessful) {
                    // Mark quest as completed
                    await connection.query(
                        'UPDATE DAILY_QUESTS SET isCompleted = TRUE, completedAt = CURRENT_TIMESTAMP WHERE id = ?',
                        [dailyQuestId]
                    );

                    // Award points
                    await connection.query(
                        'INSERT INTO POINTS (userId, value, reason, adminId) VALUES (?, ?, ?, 1)',
                        [userId, quest.points, `Quest completed: ${quest.name}`, 1] // Using admin ID 1 as system
                    );

                    await connection.commit();
                    connection.release();
                    return {
                        success: true,
                        message: `Quest completed! You earned ${quest.points} points!`,
                        points: quest.points
                    };
                } else {
                    await connection.commit();
                    connection.release();
                    return { success: false, message: 'Invalid code. Try again!' };
                }
            } catch (error) {
                await connection.rollback();
                connection.release();
                throw error;
            }
        } catch (error) {
            console.error('\x1b[31mError submitting quest code:\x1b[0m', error);
            throw error;
        }
    }

    // Get quest statistics
    static async getStatistics() {
        try {
            // Total quests
            const [totalQuests] = await pool.query('SELECT COUNT(*) as count FROM QUESTS');

            // Active quests
            const [activeQuests] = await pool.query('SELECT COUNT(*) as count FROM QUESTS WHERE isActive = TRUE');

            // Today's assignments
            const today = new Date().toISOString().split('T')[0];
            const [todayAssignments] = await pool.query(
                'SELECT COUNT(*) as count FROM DAILY_QUESTS WHERE assignedDate = ?',
                [today]
            );

            // Today's completions
            const [todayCompletions] = await pool.query(
                'SELECT COUNT(*) as count FROM DAILY_QUESTS WHERE assignedDate = ? AND isCompleted = TRUE',
                [today]
            );

            // Quest completion rates
            const [questStats] = await pool.query(`
                SELECT
                    q.name,
                    q.points,
                    COUNT(dq.id) as timesAssigned,
                    COUNT(CASE WHEN dq.isCompleted = TRUE THEN 1 END) as timesCompleted,
                    ROUND(COUNT(CASE WHEN dq.isCompleted = TRUE THEN 1 END) * 100.0 / COUNT(dq.id), 2) as completionRate
                FROM QUESTS q
                LEFT JOIN DAILY_QUESTS dq ON q.id = dq.questId
                WHERE q.isActive = TRUE
                GROUP BY q.id, q.name, q.points
                ORDER BY completionRate DESC
            `);

            return {
                totalQuests: totalQuests[0].count,
                activeQuests: activeQuests[0].count,
                todayAssignments: todayAssignments[0].count,
                todayCompletions: todayCompletions[0].count,
                questStats
            };
        } catch (error) {
            console.error('\x1b[31mError retrieving quest statistics:\x1b[0m', error);
            throw error;
        }
    }

    // Get quest configuration
    static async getConfig() {
        try {
            const [rows] = await pool.query('SELECT * FROM QUEST_CONFIG LIMIT 1');
            return rows[0] || { assignmentHour: 10, durationHours: 24 };
        } catch (error) {
            console.error('\x1b[31mError retrieving quest config:\x1b[0m', error);
            throw error;
        }
    }

    // Update quest configuration
    static async updateConfig(configData) {
        try {
            const { assignmentHour, durationHours } = configData;

            // Check if config exists
            const [existing] = await pool.query('SELECT id FROM QUEST_CONFIG LIMIT 1');

            if (existing.length > 0) {
                await pool.query(
                    'UPDATE QUEST_CONFIG SET assignmentHour = ?, durationHours = ? WHERE id = ?',
                    [assignmentHour, durationHours, existing[0].id]
                );
            } else {
                await pool.query(
                    'INSERT INTO QUEST_CONFIG (assignmentHour, durationHours) VALUES (?, ?)',
                    [assignmentHour, durationHours]
                );
            }

            return true;
        } catch (error) {
            console.error('\x1b[31mError updating quest config:\x1b[0m', error);
            throw error;
        }
    }
}

module.exports = Quest;
