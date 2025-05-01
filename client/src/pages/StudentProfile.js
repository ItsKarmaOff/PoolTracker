/**
 * ┌────────────────────────────────────────────────────────────────────────────
 * │ @author                    Christophe Vandevoir
 * ├────────────────────────────────────────────────────────────────────────────
 * │ @file           StudentProfile.js
 * │ @path          client/src/pages/StudentProfile.js
 * │ @description   StudentProfile implementation
 * │ @version       1.0.0
 * │
 * │ @email         christophe.vandevoir@epitech.eu
 * │ @date          2025-05-01
 * ├────────────────────────────────────────────────────────────────────────────
 * │ @copyright     (c) 2025 Christophe Vandevoir
 * └────────────────────────────────────────────────────────────────────────────
 */

import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { pointService } from '../services/api';
import { toast } from 'react-toastify';
import './StudentProfile.css';

const StudentProfile = () => {
    const { user } = useAuth();
    const [pointsHistory, setPointsHistory] = useState([]);
    const [totalPoints, setTotalPoints] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPointsData = async () => {
            try {
                const { history, totalPoints } = await pointService.getPointsHistory(user.id);
                setPointsHistory(history);
                setTotalPoints(totalPoints);
            } catch (error) {
                console.error('\x1b[31mError loading points:\x1b[0m', error);
                toast.error('Error loading points');
            } finally {
                setLoading(false);
            }
        };

        if (user) {
            fetchPointsData();
        }
    }, [user]);

    if (loading) {
        return (
            <div className="loading-container">
                <div className="spinner"></div>
                <p>Loading data...</p>
            </div>
        );
    }

    // Formater la date
    const formatDate = (dateString) => {
        const options = {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        };
        return new Date(dateString).toLocaleDateString('fr-FR', options);
    };

    return (
        <div className="profile-container">
            <div className="profile-header">
                <h1>My Profile</h1>
                <div className="user-card">
                    <div className="user-info">
                        <h2>{user.firstName} {user.lastName}</h2>
                        <p>{user.email}</p>
                    </div>
                    <div className="points-display">
                        <span className="points-value">{totalPoints}</span>
                        <span className="points-label">Points</span>
                    </div>
                </div>
            </div>

            <div className="points-history-section">
                <h2>Points History</h2>

                {pointsHistory.length > 0 ? (
                    <div className="history-table-container">
                        <table className="history-table">
                            <thead>
                                <tr>
                                    <th>Date</th>
                                    <th>Points</th>
                                    <th>Reason</th>
                                    <th>Administrator</th>
                                </tr>
                            </thead>
                            <tbody>
                                {pointsHistory.map((entry) => (
                                    <tr key={entry.id} className={entry.value >= 0 ? 'positive' : 'negative'}>
                                        <td>{formatDate(entry.createdAt)}</td>
                                        <td className="points-cell">
                                            {entry.value > 0 ? `+${entry.value}` : entry.value}
                                        </td>
                                        <td>{entry.reason || '-'}</td>
                                        <td>{entry.adminFirstName} {entry.adminLastName}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="empty-history-message">
                        <p>You haven't received any points yet.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default StudentProfile;
