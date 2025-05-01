/**
 * ┌────────────────────────────────────────────────────────────────────────────
 * │ @author                    Christophe Vandevoir
 * ├────────────────────────────────────────────────────────────────────────────
 * │ @file           AdminUsers.js
 * │ @path          client/src/pages/admin/AdminUsers.js
 * │ @description   AdminUsers implementation
 * │ @version       1.0.0
 * │
 * │ @email         christophe.vandevoir@epitech.eu
 * │ @date          2025-05-01
 * ├────────────────────────────────────────────────────────────────────────────
 * │ @copyright     (c) 2025 Christophe Vandevoir
 * └────────────────────────────────────────────────────────────────────────────
 */

import React, { useState, useEffect } from 'react';
import { userService } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'react-toastify';
import './AdminPages.css';

const AdminUsers = () => {
    const { isAdmin } = useAuth();
    const [users, setUsers] = useState([]);
    const [selectedUserType, setSelectedUserType] = useState('all');
    const [loading, setLoading] = useState(true);

    const [formData, setFormData] = useState({
        id: null,
        email: '',
        firstName: '',
        lastName: '',
        role: 'STUDENT',
        originalRole: null
    });

    const [showForm, setShowForm] = useState(false);
    const [isEditing, setIsEditing] = useState(false);

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                let userData;
                if (selectedUserType === 'all') {
                    userData = await userService.getAllUsers();
                } else {
                    userData = await userService.getUsersByRole(selectedUserType.toUpperCase());
                }
                setUsers(userData);
            } catch (error) {
                console.error('\x1b[31mError loading users:\x1b[0m', error);
                toast.error('Error loading users');
            } finally {
                setLoading(false);
            }
        };

        fetchUsers();
    }, [selectedUserType]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
    };

    const handleAddUser = (role) => {
        setFormData({
            id: null,
            email: '',
            firstName: '',
            lastName: '',
            role: role,
            originalRole: null
        });
        setIsEditing(false);
        setShowForm(true);
    };

    const handleEditUser = (user) => {
        setFormData({
            id: user.id,
            email: user.email,
            firstName: user.firstName || '',
            lastName: user.lastName || '',
            role: user.role,
            originalRole: user.role
        });
        setIsEditing(true);
        setShowForm(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            setLoading(true);
            const userData = {
                email: formData.email,
                firstName: formData.firstName,
                lastName: formData.lastName
            };

            if (isEditing) {
                // Check if role has changed
                const roleChanged = formData.role !== formData.originalRole;

                if (roleChanged && isAdmin) {
                    // Use generic update method to handle role change
                    userData.role = formData.role;
                    await userService.updateUser(formData.id, userData);
                    toast.success(`User updated and role changed to ${formData.role}`);
                } else {
                    // Update existing user based on original role without changing role
                    switch (formData.originalRole) {
                        case 'ADMIN':
                            if (isAdmin) await userService.updateAdmin(formData.id, userData);
                            break;
                        case 'APE':
                            if (isAdmin) await userService.updateAPE(formData.id, userData);
                            break;
                        case 'AER':
                            await userService.updateAER(formData.id, userData);
                            break;
                        case 'STUDENT':
                            await userService.updateStudent(formData.id, userData);
                            break;
                    }
                    toast.success('User updated successfully');
                }
            } else {
                // Create new user based on role
                switch (formData.role) {
                    case 'ADMIN':
                        if (isAdmin) await userService.createAdmin(userData);
                        break;
                    case 'APE':
                        if (isAdmin) await userService.createAPE(userData);
                        break;
                    case 'AER':
                        await userService.createAER(userData);
                        break;
                    case 'STUDENT':
                        await userService.createStudent(userData);
                        break;
                }
                toast.success('User created successfully');
            }

            // Refresh the user list
            let updatedUsers;
            if (selectedUserType === 'all') {
                updatedUsers = await userService.getAllUsers();
            } else {
                updatedUsers = await userService.getUsersByRole(selectedUserType.toUpperCase());
            }
            setUsers(updatedUsers);

            setShowForm(false);
            setFormData({
                id: null,
                email: '',
                firstName: '',
                lastName: '',
                role: 'STUDENT',
                originalRole: null
            });
        } catch (error) {
            console.error('\x1b[31mError during user operation:\x1b[0m', error);
            toast.error(error.response?.data?.message || 'Error processing user operation');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteUser = async (user) => {
        if (!window.confirm(`Are you sure you want to delete this ${user.role.toLowerCase()} account?`)) {
            return;
        }

        try {
            setLoading(true);

            // Delete user based on role
            switch (user.role) {
                case 'ADMIN':
                    if (isAdmin) await userService.deleteAdmin(user.id);
                    break;
                case 'APE':
                    if (isAdmin) await userService.deleteAPE(user.id);
                    break;
                case 'AER':
                    await userService.deleteAER(user.id);
                    break;
                case 'STUDENT':
                    await userService.deleteStudent(user.id);
                    break;
            }

            toast.success('User deleted successfully');

            // Refresh the user list
            let updatedUsers;
            if (selectedUserType === 'all') {
                updatedUsers = await userService.getAllUsers();
            } else {
                updatedUsers = await userService.getUsersByRole(selectedUserType.toUpperCase());
            }
            setUsers(updatedUsers);
        } catch (error) {
            console.error('\x1b[31mError deleting user:\x1b[0m', error);
            toast.error(error.response?.data?.message || 'Error deleting user');
        } finally {
            setLoading(false);
        }
    };

    const handleFilterChange = (e) => {
        setSelectedUserType(e.target.value);
    };

    // Check if user can manage this type of account
    const canManageAccountType = (role) => {
        if (isAdmin) return true;
        if (role === 'ADMIN' || role === 'APE') return false;
        return true;
    };

    if (loading && users.length === 0) {
        return (
            <div className="loading-container">
                <div className="spinner"></div>
                <p>Loading data...</p>
            </div>
        );
    }

    return (
        <div className="admin-container">
            <div className="admin-header">
                <h1>User Management</h1>
                <div className="admin-controls">
                    <select
                        value={selectedUserType}
                        onChange={handleFilterChange}
                        className="filter-select"
                    >
                        <option value="all">All Users</option>
                        <option value="admin">Administrators</option>
                        <option value="ape">APE Users</option>
                        <option value="aer">AER Users</option>
                        <option value="student">Students</option>
                    </select>

                    <div className="add-buttons">
                        {isAdmin && (
                            <>
                                <button
                                    className="btn-add"
                                    onClick={() => handleAddUser('ADMIN')}
                                >
                                    Add Admin
                                </button>
                                <button
                                    className="btn-add"
                                    onClick={() => handleAddUser('APE')}
                                >
                                    Add APE
                                </button>
                            </>
                        )}
                        <button
                            className="btn-add"
                            onClick={() => handleAddUser('AER')}
                        >
                            Add AER
                        </button>
                        <button
                            className="btn-add"
                            onClick={() => handleAddUser('STUDENT')}
                        >
                            Add Student
                        </button>
                    </div>
                </div>
            </div>

            {showForm && (
                <div className="form-container">
                    <h2>{isEditing ? `Edit ${formData.role}` : `Add New ${formData.role}`}</h2>
                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label htmlFor="email">Email *</label>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="firstName">First Name</label>
                            <input
                                type="text"
                                id="firstName"
                                name="firstName"
                                value={formData.firstName}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="lastName">Last Name</label>
                            <input
                                type="text"
                                id="lastName"
                                name="lastName"
                                value={formData.lastName}
                                onChange={handleChange}
                            />
                        </div>

                        {isEditing && isAdmin && (
                            <div className="form-group">
                                <label htmlFor="role">User Role</label>
                                <select
                                    id="role"
                                    name="role"
                                    value={formData.role}
                                    onChange={handleChange}
                                >
                                    <option value="ADMIN">Administrator</option>
                                    <option value="APE">APE</option>
                                    <option value="AER">AER</option>
                                    <option value="STUDENT">Student</option>
                                </select>
                                {formData.originalRole === 'ADMIN' && (
                                    <small className="form-help">
                                        Warning: Changing the role of an administrator could impact system access.
                                    </small>
                                )}
                            </div>
                        )}

                        <div className="form-actions">
                            <button type="submit" className="btn-save" disabled={loading}>
                                {loading ? 'Saving...' : 'Save'}
                            </button>
                            <button
                                type="button"
                                className="btn-cancel"
                                onClick={() => setShowForm(false)}
                                disabled={loading}
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div className="table-container">
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>Email</th>
                            <th>First Name</th>
                            <th>Last Name</th>
                            <th>Role</th>
                            <th>Created At</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map(user => (
                            <tr key={user.id}>
                                <td>{user.email}</td>
                                <td>{user.firstName || '-'}</td>
                                <td>{user.lastName || '-'}</td>
                                <td>{user.role}</td>
                                <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                                <td className="actions-cell">
                                    {canManageAccountType(user.role) && (
                                        <>
                                            <button
                                                className="btn-edit"
                                                onClick={() => handleEditUser(user)}
                                            >
                                                Edit
                                            </button>
                                            <button
                                                className="btn-delete"
                                                onClick={() => handleDeleteUser(user)}
                                            >
                                                Delete
                                            </button>
                                        </>
                                    )}
                                </td>
                            </tr>
                        ))}

                        {users.length === 0 && (
                            <tr>
                                <td colSpan="6" className="empty-message">
                                    No users found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AdminUsers;
