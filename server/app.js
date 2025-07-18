/**
 * ┌────────────────────────────────────────────────────────────────────────────
 * │ @author                    Christophe Vandevoir
 * ├────────────────────────────────────────────────────────────────────────────
 * │ @file          app.js
 * │ @path          server/app.js
 * │ @description   app implementation
 * │ @version       1.0.0
 * │
 * │ @email         christophe.vandevoir@epitech.eu
 * │ @date          2025-04-29
 * ├────────────────────────────────────────────────────────────────────────────
 * │ @copyright     (c) 2025 Christophe Vandevoir
 * └────────────────────────────────────────────────────────────────────────────
 */

const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const dotenv = require('dotenv');
const { initDatabase } = require('./config/database');

// Load environment variables
dotenv.config();

// Initialize Express application
const app = express();

// Middleware for parsing JSON
app.use(express.json());

// Middleware for handling CORS
app.use(cors());

// Middleware for logging HTTP requests
app.use(morgan('dev'));

// Initialize the database
initDatabase().then(() => {
    // Start quest scheduler after database initialization
    const questScheduler = require('./services/questScheduler');
    questScheduler.start();
    console.log('\x1b[32mQuest scheduler initialized\x1b[0m');
}).catch(err => {
    console.error('\x1b[31mError initializing the database:\x1b[0m', err);
    process.exit(1);
});

// Import routes
const authRoutes = require('./routes/auth');
const teamRoutes = require('./routes/teams');
const studentRoutes = require('./routes/students');
const pointRoutes = require('./routes/points');
const userRoutes = require('./routes/users');
const questRoutes = require('./routes/quests');

// Use routes
app.use('/api/auth', authRoutes);
app.use('/api/teams', teamRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/points', pointRoutes);
app.use('/api/users', userRoutes);
app.use('/api/quests', questRoutes);

// Default route
app.get('/', (req, res) => {
    res.json({ message: 'Pool tracking API for Epitech pool management' });
});

// Middleware to handle 404 errors
app.use((req, res, next) => {
    res.status(404).json({ message: 'Route not found' });
});

// Middleware to handle errors
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        message: 'Server error',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

// Handle SIGINT signal
process.on('SIGINT', () => {
    console.log('\x1b[33mShutting down gracefully...\x1b[0m');
    const questScheduler = require('./services/questScheduler');
    questScheduler.stop();
    process.exit(0);
});

// Handle SIGTERM signal (for deployment environments)
process.on('SIGTERM', () => {
    console.log('\x1b[33mShutting down gracefully...\x1b[0m');
    const questScheduler = require('./services/questScheduler');
    questScheduler.stop();
    process.exit(0);
});

module.exports = app;
