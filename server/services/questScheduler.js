/**
 * ┌────────────────────────────────────────────────────────────────────────────
 * │ @author                    Christophe Vandevoir
 * ├────────────────────────────────────────────────────────────────────────────
 * │ @file          questScheduler.js
 * │ @path          server/services/questScheduler.js
 * │ @description   questScheduler implementation
 * │ @version       1.0.0
 * │
 * │ @email         christophe.vandevoir@epitech.eu
 * │ @date          2025-07-13
 * ├────────────────────────────────────────────────────────────────────────────
 * │ @copyright     (c) 2025 Christophe Vandevoir
 * └────────────────────────────────────────────────────────────────────────────
 */

const Quest = require('../models/quest');

class QuestScheduler {
    constructor() {
        this.intervalId = null;
        this.isRunning = false;
    }

    // Start the scheduler
    start() {
        if (this.isRunning) {
            console.log('Quest scheduler is already running');
            return;
        }

        this.isRunning = true;
        console.log('\x1b[32mQuest scheduler started\x1b[0m');

        // Check immediately on startup
        this.checkAndAssignQuests();

        // Then check every minute
        this.intervalId = setInterval(() => {
            this.checkAndAssignQuests();
        }, 60000); // Check every minute
    }

    // Stop the scheduler
    stop() {
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }
        this.isRunning = false;
        console.log('\x1b[33mQuest scheduler stopped\x1b[0m');
    }

    // Check if it's time to assign quests and do it
    async checkAndAssignQuests() {
        try {
            const config = await Quest.getConfig();
            const now = new Date();
            const currentHour = now.getHours();
            const currentMinute = now.getMinutes();

            // Check if it's the assignment hour and within the first minute
            if (currentHour === config.assignmentHour && currentMinute === 0) {
                console.log(`\x1b[34mAssigning daily quests at ${now.toLocaleTimeString()}\x1b[0m`);
                await Quest.assignDailyQuests();
            }
        } catch (error) {
            console.error('\x1b[31mError in quest scheduler:\x1b[0m', error);
        }
    }

    // Get scheduler status
    getStatus() {
        return {
            isRunning: this.isRunning,
            intervalId: this.intervalId !== null
        };
    }
}

// Create singleton instance
const questScheduler = new QuestScheduler();

module.exports = questScheduler;
