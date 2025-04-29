/**
 * ┌────────────────────────────────────────────────────────────────────────────
 * │ @author                    Christophe Vandevoir
 * ├────────────────────────────────────────────────────────────────────────────
 * │ @file           authController.js
 * │ @path          server/controllers/authController.js
 * │ @description   authController implementation
 * │ @version       1.0.0
 * │
 * │ @email         christophe.vandevoir@epitech.eu
 * │ @date          2025-04-29
 * ├────────────────────────────────────────────────────────────────────────────
 * │ @copyright     (c) 2025 Christophe Vandevoir
 * └────────────────────────────────────────────────────────────────────────────
 */

const User = require('../models/user');
const jwt = require('jsonwebtoken');

// Token validity period: 24h
const TOKEN_EXPIRY = '24h';

// Generate a JWT token
const generateToken = (user) => {
    return jwt.sign(
        {
            id: user.id,
            email: user.email,
            role: user.role
        },
        process.env.JWT_SECRET,
        { expiresIn: TOKEN_EXPIRY }
    );
};

// Authentication (login)
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Check if the user exists
        const user = await User.findByEmail(email);
        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // If the user hasn't set their password yet (first login)
        if (!user.password) {
            return res.status(200).json({
                message: 'First login detected',
                requiresPasswordSet: true,
                userId: user.id
            });
        }

        // Check if the password is valid
        const isPasswordValid = await User.verifyPassword(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Generate a JWT token
        const token = generateToken(user);

        // Return user information without the password
        const { password: _, ...userWithoutPassword } = user;

        res.status(200).json({
            message: 'Authentication successful',
            user: userWithoutPassword,
            token,
            isFirstLogin: user.isFirstLogin
        });
    } catch (error) {
        console.error('\x1b[31mAuthentication error:\x1b[0m', error);
        res.status(500).json({ message: 'Server error during authentication' });
    }
};

// Set or reset password
exports.setPassword = async (req, res) => {
    try {
        const { userId, password } = req.body;

        // Update the password and mark first login as completed
        const updated = await User.update(userId, {
            password,
            isFirstLogin: false
        });

        if (!updated) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Get the updated user
        const user = await User.findById(userId);

        // Generate a JWT token
        const token = generateToken(user);

        // Return user information without the password
        const { password: _, ...userWithoutPassword } = user;

        res.status(200).json({
            message: 'Password set successfully',
            user: userWithoutPassword,
            token
        });
    } catch (error) {
        console.error('\x1b[31mPassword setting error:\x1b[0m', error);
        res.status(500).json({ message: 'Server error while setting password' });
    }
};

// Get the connected user's profile
exports.getProfile = async (req, res) => {
    try {
        // User ID is already available in req.user thanks to the authentication middleware
        const user = await User.findById(req.user.id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Return user information without the password
        const { password, ...userWithoutPassword } = user;

        res.status(200).json({ user: userWithoutPassword });
    } catch (error) {
        console.error('\x1b[31mError retrieving user profile:\x1b[0m', error);
        res.status(500).json({ message: 'Server error while retrieving profile' });
    }
};
