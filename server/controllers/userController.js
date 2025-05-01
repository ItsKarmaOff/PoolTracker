/**
 * ┌────────────────────────────────────────────────────────────────────────────
 * │ @author                    Christophe Vandevoir
 * ├────────────────────────────────────────────────────────────────────────────
 * │ @file           userController.js
 * │ @path          server/controllers/userController.js
 * │ @description   userController implementation
 * │ @version       1.0.0
 * │
 * │ @email         christophe.vandevoir@epitech.eu
 * │ @date          2025-05-01
 * ├────────────────────────────────────────────────────────────────────────────
 * │ @copyright     (c) 2025 Christophe Vandevoir
 * └────────────────────────────────────────────────────────────────────────────
 */

const User = require('../models/user');

// Get all users (for admin interface)
exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.getAll();

        // Remove password field from response
        const usersWithoutPassword = users.map(user => {
            const { password, ...userWithoutPassword } = user;
            return userWithoutPassword;
        });

        res.status(200).json({ users: usersWithoutPassword });
    } catch (error) {
        console.error('\x1b[31mError retrieving users:\x1b[0m', error);
        res.status(500).json({ message: 'Server error while retrieving users' });
    }
};

// Get users by role
exports.getUsersByRole = async (req, res) => {
    try {
        const { role } = req.params;

        // Validate role parameter
        const validRoles = ['ADMIN', 'APE', 'AER', 'STUDENT'];
        if (!validRoles.includes(role)) {
            return res.status(400).json({ message: 'Invalid role specified' });
        }

        const users = await User.getAllByRole(role);

        // Remove password field from response
        const usersWithoutPassword = users.map(user => {
            const { password, ...userWithoutPassword } = user;
            return userWithoutPassword;
        });

        res.status(200).json({ users: usersWithoutPassword });
    } catch (error) {
        console.error('\x1b[31mError retrieving users by role:\x1b[0m', error);
        res.status(500).json({ message: 'Server error while retrieving users' });
    }
};

// Create ADMIN user
exports.createAdmin = async (req, res) => {
    await createUserWithRole(req, res, 'ADMIN');
};

// Create APE user
exports.createAPE = async (req, res) => {
    await createUserWithRole(req, res, 'APE');
};

// Create AER user
exports.createAER = async (req, res) => {
    await createUserWithRole(req, res, 'AER');
};

// Helper function to create a user with a specific role
async function createUserWithRole(req, res, role) {
    try {
        const { email, firstName, lastName } = req.body;

        if (!email) {
            return res.status(400).json({ message: 'Email is required' });
        }

        // Check if email is already in use
        const existingUser = await User.findByEmail(email);
        if (existingUser) {
            return res.status(400).json({ message: 'This email is already in use' });
        }

        // Create user without password (it will be set during first login)
        const newUser = await User.create({
            email,
            firstName,
            lastName,
            role,
            isFirstLogin: true
        });

        res.status(201).json({
            message: `${role} user created successfully`,
            user: {
                id: newUser.id,
                email: newUser.email,
                firstName: newUser.firstName,
                lastName: newUser.lastName,
                role: newUser.role
            }
        });
    } catch (error) {
        console.error(`\x1b[31mError creating ${role} user:\x1b[0m`, error);
        res.status(500).json({ message: `Server error while creating ${role} user` });
    }
}

// Update ADMIN user
exports.updateAdmin = async (req, res) => {
    await updateUserWithRole(req, res, 'ADMIN');
};

// Update APE user
exports.updateAPE = async (req, res) => {
    await updateUserWithRole(req, res, 'APE');
};

// Update AER user
exports.updateAER = async (req, res) => {
    await updateUserWithRole(req, res, 'AER');
};

// Helper function to update a user with a specific role
async function updateUserWithRole(req, res, role) {
    try {
        const { id } = req.params;
        const { email, firstName, lastName, newRole } = req.body;

        // Check if the user exists and has the correct role
        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (user.role !== role) {
            return res.status(400).json({ message: `User is not a ${role}` });
        }

        // If the email changes, check that it's not already in use
        if (email && email !== user.email) {
            const existingUser = await User.findByEmail(email);
            if (existingUser && existingUser.id !== parseInt(id)) {
                return res.status(400).json({ message: 'This email is already in use' });
            }
        }

        // Check if attempting to change role and if has permission (only ADMIN can change roles)
        const updateData = {
            email: email || user.email,
            firstName: firstName || user.firstName,
            lastName: lastName || user.lastName
        };

        // If new role is provided and requester is ADMIN, update the role
        if (newRole && req.user.role === 'ADMIN') {
            updateData.role = newRole;
        }

        // Update the user
        const updated = await User.update(id, updateData);

        res.status(200).json({ message: `User updated successfully` });
    } catch (error) {
        console.error(`\x1b[31mError updating ${role} user:\x1b[0m`, error);
        res.status(500).json({ message: `Server error while updating ${role} user` });
    }
}

// Delete ADMIN user
exports.deleteAdmin = async (req, res) => {
    await deleteUserWithRole(req, res, 'ADMIN');
};

// Delete APE user
exports.deleteAPE = async (req, res) => {
    await deleteUserWithRole(req, res, 'APE');
};

// Delete AER user
exports.deleteAER = async (req, res) => {
    await deleteUserWithRole(req, res, 'AER');
};

// Generic user update, including role changes (admin only)
exports.updateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const { email, firstName, lastName, role } = req.body;

        // Check if the user exists
        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Only ADMIN can change roles
        const updateData = {
            email: email || user.email,
            firstName: firstName || user.firstName,
            lastName: lastName || user.lastName
        };

        // Verify permissions for role change
        if (role && role !== user.role) {
            // Only ADMIN can change roles
            if (req.user.role !== 'ADMIN') {
                return res.status(403).json({ message: 'Only administrators can change user roles' });
            }

            // Prevent changing the last ADMIN
            if (user.role === 'ADMIN') {
                const admins = await User.getAllByRole('ADMIN');
                if (admins.length <= 1) {
                    return res.status(400).json({ message: 'Cannot change role of the last administrator account' });
                }
            }

            updateData.role = role;
        }

        // If the email changes, check that it's not already in use
        if (email && email !== user.email) {
            const existingUser = await User.findByEmail(email);
            if (existingUser && existingUser.id !== parseInt(id)) {
                return res.status(400).json({ message: 'This email is already in use' });
            }
        }

        // Update the user
        const updated = await User.update(id, updateData);

        res.status(200).json({
            message: 'User updated successfully',
            roleChanged: role && role !== user.role
        });
    } catch (error) {
        console.error('\x1b[31mError updating user:\x1b[0m', error);
        res.status(500).json({ message: 'Server error while updating user' });
    }
};

// Helper function to delete a user with a specific role
async function deleteUserWithRole(req, res, role) {
    try {
        const { id } = req.params;

        // Check if the user exists and has the correct role
        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (user.role !== role) {
            return res.status(400).json({ message: `User is not a ${role}` });
        }

        // Prevent deleting the last ADMIN
        if (role === 'ADMIN') {
            const admins = await User.getAllByRole('ADMIN');
            if (admins.length <= 1) {
                return res.status(400).json({ message: 'Cannot delete the last administrator account' });
            }
        }

        // Delete the user
        const deleted = await User.delete(id);

        res.status(200).json({ message: `${role} user deleted successfully` });
    } catch (error) {
        console.error(`\x1b[31mError deleting ${role} user:\x1b[0m`, error);
        res.status(500).json({ message: `Server error while deleting ${role} user` });
    }
}
