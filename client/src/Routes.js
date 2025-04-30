/**
 * ┌────────────────────────────────────────────────────────────────────────────
 * │ @author                    Christophe Vandevoir
 * ├────────────────────────────────────────────────────────────────────────────
 * │ @file           Routes.js
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
import ProtectedRoute from './components/ProtectedRoute';

// Public pages
import Login from './pages/Login';

// Pages for authenticated users
import HomePage from './pages/HomePage';
import StudentProfile from './pages/StudentProfile';
import TeamDetails from './pages/TeamDetails';

// Admin pages
import AdminStudents from './pages/admin/AdminStudents';
import AdminTeams from './pages/admin/AdminTeams';
import AdminPoints from './pages/admin/AdminPoints';

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

            {/* Admin routes */}
            <Route
                path="/admin/students"
                element={
                    <ProtectedRoute adminOnly={true}>
                        <AdminStudents />
                    </ProtectedRoute>
                }
            />

            <Route
                path="/admin/teams"
                element={
                    <ProtectedRoute adminOnly={true}>
                        <AdminTeams />
                    </ProtectedRoute>
                }
            />

            <Route
                path="/admin/points"
                element={
                    <ProtectedRoute adminOnly={true}>
                        <AdminPoints />
                    </ProtectedRoute>
                }
            />

            {/* Default redirection */}
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
};

export default AppRoutes;