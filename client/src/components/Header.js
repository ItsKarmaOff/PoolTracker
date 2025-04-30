/**
 * ┌────────────────────────────────────────────────────────────────────────────
 * │ @author                    Christophe Vandevoir
 * ├────────────────────────────────────────────────────────────────────────────
 * │ @file           Header.js
 * │ @path          client/src/components/Header.js
 * │ @description   Header implementation
 * │ @version       1.0.0
 * │
 * │ @email         christophe.vandevoir@epitech.eu
 * │ @date          2025-04-30
 * ├────────────────────────────────────────────────────────────────────────────
 * │ @copyright     (c) 2025 Christophe Vandevoir
 * └────────────────────────────────────────────────────────────────────────────
 */

import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './Header.css';

const Header = () => {
    const { user, isAuthenticated, isAdmin, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <header className="header">
            <div className="logo">
                <Link to="/"><img src="/assets/images/epitech-logo.png" alt="Pool Tracker" width="165" height="40" /> Pool Tracker</Link>
            </div>

            {isAuthenticated ? (
                <nav className="nav">
                    <ul className="nav-links">
                        <li>
                            <Link to="/">Home</Link>
                        </li>
                        {isAdmin ? (
                            <>
                                <li>
                                    <Link to="/admin/students">Students</Link>
                                </li>
                                <li>
                                    <Link to="/admin/teams">Teams</Link>
                                </li>
                                <li>
                                    <Link to="/admin/points">Points</Link>
                                </li>
                            </>
                        ) : (
                            <li>
                                <Link to="/profile">My Profile</Link>
                            </li>
                        )}
                    </ul>

                    <div className="user-info">
                        <span>
                            {user.firstName} {user.lastName} ({isAdmin ? 'Admin' : 'Student'})
                        </span>
                        <button className="logout-btn" onClick={handleLogout}>
                            Logout
                        </button>
                    </div>
                </nav>
            ) : (
                <div className="auth-links">
                    <Link to="/login">Login</Link>
                </div>
            )}
        </header>
    );
};

export default Header;
