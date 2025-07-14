/**
 * ┌────────────────────────────────────────────────────────────────────────────
 * │ @author                    Christophe Vandevoir
 * ├────────────────────────────────────────────────────────────────────────────
 * │ @file          StudentQuests.js
 * │ @path          client/src/pages/StudentQuests.js
 * │ @description   StudentQuests implementation
 * │ @version       1.0.0
 * │
 * │ @email         christophe.vandevoir@epitech.eu
 * │ @date          2025-07-14
 * ├────────────────────────────────────────────────────────────────────────────
 * │ @copyright     (c) 2025 Christophe Vandevoir
 * └────────────────────────────────────────────────────────────────────────────
 */

import React, { useState, useEffect } from 'react';
import { questService } from '../services/api';
import { toast } from 'react-toastify';
import './StudentQuests.css';

const StudentQuests = () => {
    const [dailyQuest, setDailyQuest] = useState(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [code, setCode] = useState('');
    const [timeRemaining, setTimeRemaining] = useState(null);

    useEffect(() => {
        fetchDailyQuest();
    }, []);

    useEffect(() => {
        let interval = null;
        if (dailyQuest && !dailyQuest.isCompleted) {
            interval = setInterval(() => {
                updateTimeRemaining();
            }, 1000);
        }
        return () => {
            if (interval) clearInterval(interval);
        };
    }, [dailyQuest]);

    const fetchDailyQuest = async () => {
        try {
            setLoading(true);
            const questData = await questService.getDailyQuest();
            setDailyQuest(questData);
            updateTimeRemaining(questData);
        } catch (error) {
            if (error.response?.status === 404) {
                setDailyQuest(null);
            } else {
                console.error('Error loading daily quest:', error);
                toast.error('Error loading daily quest');
            }
        } finally {
            setLoading(false);
        }
    };

    const updateTimeRemaining = (quest = dailyQuest) => {
        if (!quest || quest.isCompleted) {
            setTimeRemaining(null);
            return;
        }

        const now = new Date();
        const expiresAt = new Date(quest.expiresAt);
        const diff = expiresAt - now;

        if (diff <= 0) {
            setTimeRemaining('Expired');
        } else {
            const hours = Math.floor(diff / (1000 * 60 * 60));
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((diff % (1000 * 60)) / 1000);

            setTimeRemaining(`${hours}h ${minutes}m ${seconds}s`);
        }
    };

    const handleSubmitCode = async (e) => {
        e.preventDefault();

        if (!code.trim()) {
            toast.error('Please enter a code');
            return;
        }

        try {
            setSubmitting(true);
            const result = await questService.submitQuestCode({
                questId: dailyQuest.id,
                code: code.trim()
            });

            if (result.success) {
                toast.success(result.message);
                setDailyQuest({ ...dailyQuest, isCompleted: true, completedAt: new Date() });
                setCode('');
            } else {
                toast.error(result.message);
                setCode('');
            }
        } catch (error) {
            console.error('Error submitting quest code:', error);
            toast.error(error.response?.data?.message || 'Error submitting code');
            setCode('');
        } finally {
            setSubmitting(false);
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('fr-FR', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    if (loading) {
        return (
            <div className="loading-container">
                <div className="spinner"></div>
                <p>Loading your daily quest...</p>
            </div>
        );
    }

    return (
        <div className="quest-container">
            <div className="quest-header">
                <h1>Daily Quest</h1>
                <p className="quest-date">{formatDate(new Date())}</p>
            </div>

            {dailyQuest ? (
                <div className="quest-card">
                    <div className="quest-status">
                        {dailyQuest.isCompleted ? (
                            <div className="status-completed">
                                <div className="status-icon">✅</div>
                                <div className="status-text">
                                    <h3>Quest Completed!</h3>
                                    <p>Completed on {new Date(dailyQuest.completedAt).toLocaleTimeString('fr-FR')}</p>
                                    <p className="points-earned">You earned {dailyQuest.points} points!</p>
                                </div>
                            </div>
                        ) : timeRemaining === 'Expired' ? (
                            <div className="status-expired">
                                <div className="status-icon">❌</div>
                                <div className="status-text">
                                    <h3>Quest Expired</h3>
                                    <p>This quest has expired. Try again tomorrow!</p>
                                </div>
                            </div>
                        ) : (
                            <div className="status-active">
                                <div className="status-icon">🎯</div>
                                <div className="status-text">
                                    <h3>Active Quest</h3>
                                    <p className="time-remaining">
                                        <strong>Time remaining: {timeRemaining}</strong>
                                    </p>
                                    <p className="potential-points">Potential reward: {dailyQuest.points} points</p>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="quest-details">
                        <h2 className="quest-title">{dailyQuest.name}</h2>
                        <p className="quest-description">{dailyQuest.description}</p>
                    </div>

                    {!dailyQuest.isCompleted && timeRemaining !== 'Expired' && (
                        <div className="quest-submission">
                            <h3>Enter Quest Code</h3>
                            <p className="submission-instructions">
                                Complete the quest task and enter the secret code you discovered:
                            </p>
                            <form onSubmit={handleSubmitCode} className="code-form">
                                <div className="code-input-group">
                                    <input
                                        type="text"
                                        value={code}
                                        onChange={(e) => setCode(e.target.value.toUpperCase())}
                                        placeholder="Enter secret code"
                                        className="code-input"
                                        disabled={submitting}
                                        autoComplete="off"
                                    />
                                    <button
                                        type="submit"
                                        className="submit-code-btn"
                                        disabled={submitting || !code.trim()}
                                    >
                                        {submitting ? 'Validating...' : 'Submit Code'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}
                </div>
            ) : (
                <div className="no-quest-card">
                    <div className="no-quest-icon">📋</div>
                    <h2>No Quest Today</h2>
                    <p>No quest has been assigned to you today.</p>
                    <p>Daily quests are usually assigned at 10:00 AM. Check back later!</p>
                </div>
            )}

            <div className="quest-info">
                <h3>About Daily Quests</h3>
                <ul>
                    <li>A new quest is assigned to you every day at the designated time</li>
                    <li>Each student receives a different quest</li>
                    <li>Complete the task described in your quest</li>
                    <li>Find the secret code and enter it to earn points</li>
                    <li>Quests expire after the set duration, so act quickly!</li>
                </ul>
            </div>
        </div>
    );
};

export default StudentQuests;
