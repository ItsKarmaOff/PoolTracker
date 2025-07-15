/**
 * ┌────────────────────────────────────────────────────────────────────────────
 * │ @author                    Christophe Vandevoir
 * ├────────────────────────────────────────────────────────────────────────────
 * │ @file          Routes.js
 * │ @path          client/src/Routes.js
 * │ @description   Routes implementation
 * │ @version       1.0.0
 * │
 * │ @email         christophe.vandevoir@epitech.eu
 * │ @date          2025-04-30
 * ├────────────────────────────────────────────────────────────────────────────
 * │ @copyright     (c) 2025 Christophe Vandevoir
 * └────────────────────────────────────────────────────────────────────────────
 */

import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';

// Public pages
import Login from './pages/Login';

// Pages for authenticated users
import HomePage from './pages/HomePage';
import StudentProfile from './pages/StudentProfile';
import TeamDetails from './pages/TeamDetails';
import StudentQuests from './pages/StudentQuests';
import Dashboard from './pages/Dashboard';

// Admin pages
import AdminUsers from './pages/admin/AdminUsers';
import AdminStudents from './pages/admin/AdminStudents';
import AdminTeams from './pages/admin/AdminTeams';
import AdminPoints from './pages/admin/AdminPoints';
import AdminHistory from './pages/admin/AdminHistory';
import AdminQuests from './pages/admin/AdminQuests';

// Protected route component with role-based access
const ProtectedRoute = ({ children, requiredRoles = [] }) => {
    const { isAuthenticated, loading, user } = useAuth();

    if (loading) {
        return (
            <div className="loading-container">
                <div className="spinner"></div>
                <p>Loading...</p>
            </div>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    if (requiredRoles.length > 0 && !requiredRoles.includes(user.role)) {
        return <Navigate to="/" replace />;
    }

    return children;
};

const AppRoutes = () => {
    return (
        <Routes>
            {/* Public routes */}
            <Route path="/login" element={<Login />} />

            {/* Protected routes (requiring authentication) */}
            <Route
                path="/"
                element={
                    <ProtectedRoute>
                        <HomePage />
                    </ProtectedRoute>
                }
            />

            <Route
                path="/profile"
                element={
                    <ProtectedRoute>
                        <StudentProfile />
                    </ProtectedRoute>
                }
            />

            <Route
                path="/teams/:id"
                element={
                    <ProtectedRoute>
                        <TeamDetails />
                    </ProtectedRoute>
                }
            />

            {/* Quest route - accessible by all authenticated users */}
            <Route
                path="/quests"
                element={
                    <ProtectedRoute>
                        <StudentQuests />
                    </ProtectedRoute>
                }
            />

            {/* Dashboard route - only accessible by ADMIN */}
            <Route
                path="/dashboard"
                element={
                    <ProtectedRoute requiredRoles={['ADMIN']}>
                        <Dashboard />
                    </ProtectedRoute>
                }
            />

            {/* Admin routes - only accessible by ADMIN and APE */}
            <Route
                path="/admin/users"
                element={
                    <ProtectedRoute requiredRoles={['ADMIN', 'APE']}>
                        <AdminUsers />
                    </ProtectedRoute>
                }
            />

            <Route
                path="/admin/students"
                element={
                    <ProtectedRoute requiredRoles={['ADMIN', 'APE']}>
                        <AdminStudents />
                    </ProtectedRoute>
                }
            />

            <Route
                path="/admin/teams"
                element={
                    <ProtectedRoute requiredRoles={['ADMIN', 'APE']}>
                        <AdminTeams />
                    </ProtectedRoute>
                }
            />

            {/* Points management - accessible by ADMIN, APE, and AER */}
            <Route
                path="/admin/points"
                element={
                    <ProtectedRoute requiredRoles={['ADMIN', 'APE', 'AER']}>
                        <AdminPoints />
                    </ProtectedRoute>
                }
            />

            {/* History management - accessible by ADMIN, APE, and AER */}
            <Route
                path="/admin/history"
                element={
                    <ProtectedRoute requiredRoles={['ADMIN', 'APE', 'AER']}>
                        <AdminHistory />
                    </ProtectedRoute>
                }
            />

            {/* Quest management - accessible by ADMIN, APE, and AER */}
            <Route
                path="/admin/quests"
                element={
                    <ProtectedRoute requiredRoles={['ADMIN', 'APE', 'AER']}>
                        <AdminQuests />
                    </ProtectedRoute>
                }
            />

            {/* Default redirection */}
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
};

export default AppRoutes;
