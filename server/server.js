/**
 * ┌────────────────────────────────────────────────────────────────────────────
 * │ @author                    Christophe Vandevoir
 * ├────────────────────────────────────────────────────────────────────────────
 * │ @file           server.js
 * │ @path          server/server.js
 * │ @description   server implementation
 * │ @version       1.0.0
 * │
 * │ @email         christophe.vandevoir@epitech.eu
 * │ @date          2025-04-29
 * ├────────────────────────────────────────────────────────────────────────────
 * │ @copyright     (c) 2025 Christophe Vandevoir
 * └────────────────────────────────────────────────────────────────────────────
 */

const app = require('./app');

const HOST = process.env.HOST;
const PORT = process.env.PORT;

// Start the server
const server = app.listen(PORT, () => {
    console.log(`The server is running on \x1b[34mhttp://${HOST}:${PORT}\x1b[0m`);
    console.log(`Press \x1b[33mCtrl+C\x1b[0m to stop the server`);
});

// Handle SIGINT signal
process.on('SIGINT', () => {
    console.log('\x1b[33mStopping the server...\x1b[0m');
    server.close(() => {
        console.log('\x1b[32mServer stopped\x1b[0m');
        process.exit(0);
    });
});

module.exports = server;
