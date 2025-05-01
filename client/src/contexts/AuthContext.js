/**
 * ┌────────────────────────────────────────────────────────────────────────────
 * │ @author                    Christophe Vandevoir
 * ├────────────────────────────────────────────────────────────────────────────
 * │ @file           AuthContext.js
 * │ @path          client/src/contexts/AuthContext.js
 * │ @description   AuthContext implementation
 * │ @version       1.0.0
 * │
 * │ @email         christophe.vandevoir@epitech.eu
 * │ @date          2025-04-30
 * ├────────────────────────────────────────────────────────────────────────────
 * │ @copyright     (c) 2025 Christophe Vandevoir
 * └────────────────────────────────────────────────────────────────────────────
 */

import React, { createContext, useState, useEffect, useContext } from 'react';
import { authService } from '../services/api';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Check if the user is already logged in (token in localStorage)
    useEffect(() => {
        const checkAuth = async () => {
            const token = localStorage.getItem('token');
            if (token) {
                try {
                    const { user } = await authService.getProfile();
                    setUser(user);
                } catch (error) {
                    // If the token is invalid, remove it
                    localStorage.removeItem('token');
                    console.error('\x1b[31mError validating token:\x1b[0m', error);
                }
            }
            setLoading(false);
        };

        checkAuth();
    }, []);

    const login = async (email, password) => {
        try {
            setError(null);
            const data = await authService.login(email, password);

            // If it's the first login, return information without setting the user
            if (data.requiresPasswordSet) {
                return { requiresPasswordSet: true, userId: data.userId };
            }

            // Otherwise, store the token and set the user
            localStorage.setItem('token', data.token);
            setUser(data.user);
            return { success: true, isFirstLogin: data.isFirstLogin };
        } catch (error) {
            console.error('\x1b[31mLogin error:\x1b[0m', error);
            setError(error.response?.data?.message || 'Error during login');
            return { success: false, error: error.response?.data?.message || 'Error during login' };
        }
    };

    // Function to set password (first login)
    const setPassword = async (userId, password) => {
        try {
            setError(null);
            const data = await authService.setPassword(userId, password);
            localStorage.setItem('token', data.token);
            setUser(data.user);
            return { success: true };
        } catch (error) {
            console.error('\x1b[31mError setting password:\x1b[0m', error);
            setError(error.response?.data?.message || 'Error setting the password');
            return { success: false, error: error.response?.data?.message || 'Error setting the password' };
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        setUser(null);
    };

    // Check user role permissions
    const hasRole = (roles) => {
        if (!user) return false;
        if (typeof roles === 'string') return user.role === roles;
        return roles.includes(user.role);
    };

    // Context value
    const value = {
        user,
        loading,
        error,
        login,
        logout,
        setPassword,
        isAuthenticated: !!user,
        isAdmin: user?.role === 'ADMIN',
        isAPE: user?.role === 'APE',
        isAER: user?.role === 'AER',
        isStudent: user?.role === 'STUDENT',
        hasAdminPrivileges: user?.role === 'ADMIN' || user?.role === 'APE',
        canManagePoints: ['ADMIN', 'APE', 'AER'].includes(user?.role),
        hasRole
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
