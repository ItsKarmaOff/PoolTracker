/**
 * ┌────────────────────────────────────────────────────────────────────────────
 * │ @author                    Christophe Vandevoir
 * ├────────────────────────────────────────────────────────────────────────────
 * │ @file           Login.js
 * │ @path          client/src/pages/Login.js
 * │ @description   Login implementation
 * │ @version       1.0.0
 * │
 * │ @email         christophe.vandevoir@epitech.eu
 * │ @date          2025-04-30
 * ├────────────────────────────────────────────────────────────────────────────
 * │ @copyright     (c) 2025 Christophe Vandevoir
 * └────────────────────────────────────────────────────────────────────────────
 */

import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-toastify';
import './Login.css';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isFirstConnection, setIsFirstConnection] = useState(false);
    const [userId, setUserId] = useState(null);
    const [loading, setLoading] = useState(false);
    const [isFirstLoginMode, setIsFirstLoginMode] = useState(false);

    const { login, setPassword: setUserPassword } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const from = location.state?.from?.pathname || '/';

    const handleLogin = async (e) => {
        e.preventDefault();

        if (!email) {
            toast.error('Please enter your email');
            return;
        }

        // If this is not the first login, verify the password
        if (!isFirstLoginMode && !password) {
            toast.error('Please enter your password');
            return;
        }

        setLoading(true);
        try {
            // For first login, we send an empty password
            const result = await login(email, isFirstLoginMode ? '' : password);

            if (result.requiresPasswordSet) {
                // First login, the user must set their password
                setIsFirstConnection(true);
                setUserId(result.userId);
                toast.info('First login: please set your password');
            } else if (result.success) {
                toast.success('Login successful');
                navigate(from, { replace: true });
            } else if (result.error) {
                toast.error(result.error);
            }
        } catch (error) {
            toast.error('Error during login');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleSetPassword = async (e) => {
        e.preventDefault();

        if (!newPassword || !confirmPassword) {
            toast.error('Please fill in all fields');
            return;
        }

        if (newPassword !== confirmPassword) {
            toast.error('Passwords do not match');
            return;
        }

        if (newPassword.length < 6) {
            toast.error('Password must be at least 6 characters');
            return;
        }

        setLoading(true);
        try {
            const result = await setUserPassword(userId, newPassword);

            if (result.success) {
                toast.success('Password set successfully');
                navigate(from, { replace: true });
            } else if (result.error) {
                toast.error(result.error);
            }
        } catch (error) {
            toast.error('Error setting the password');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const toggleFirstLoginMode = () => {
        setIsFirstLoginMode(!isFirstLoginMode);
        setPassword('');
    };

    return (
        <div className="login-container">
            <div className="login-card">
                <h2>{isFirstConnection ? 'Set Your Password' : 'Login'}</h2>

                {isFirstConnection ? (
                    <form onSubmit={handleSetPassword}>
                        <div className="form-group">
                            <label htmlFor="newPassword">New password</label>
                            <input
                                type="password"
                                id="newPassword"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                required
                                minLength="6"
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="confirmPassword">Confirm password</label>
                            <input
                                type="password"
                                id="confirmPassword"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                                minLength="6"
                            />
                        </div>
                        <button type="submit" className="btn-login" disabled={loading}>
                            {loading ? 'Saving...' : 'Saved'}
                        </button>
                    </form>
                ) : (
                    <form onSubmit={handleLogin}>
                        <div className="form-group">
                            <label htmlFor="email">Email</label>
                            <input
                                type="email"
                                id="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>

                        {!isFirstLoginMode && (
                            <div className="form-group">
                                <label htmlFor="password">Password</label>
                                <input
                                    type="password"
                                    id="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                            </div>
                        )}

                        <div className="first-login-toggle">
                            <label>
                                <input
                                    type="checkbox"
                                    checked={isFirstLoginMode}
                                    onChange={toggleFirstLoginMode}
                                />
                                First login (new student)
                            </label>
                        </div>

                        <button type="submit" className="btn-login" disabled={loading}>
                            {loading ? 'Logging in...' : 'Login'}
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
};

export default Login;
