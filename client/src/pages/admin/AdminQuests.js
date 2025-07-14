/**
 * ┌────────────────────────────────────────────────────────────────────────────
 * │ @author                    Christophe Vandevoir
 * ├────────────────────────────────────────────────────────────────────────────
 * │ @file          AdminQuests.js
 * │ @path          client/src/pages/admin/AdminQuests.js
 * │ @description   AdminQuests implementation
 * │ @version       1.0.0
 * │
 * │ @email         christophe.vandevoir@epitech.eu
 * │ @date          2025-07-13
 * ├────────────────────────────────────────────────────────────────────────────
 * │ @copyright     (c) 2025 Christophe Vandevoir
 * └────────────────────────────────────────────────────────────────────────────
 */

import React, { useState, useEffect } from 'react';
import { questService } from '../../services/api';
import { toast } from 'react-toastify';
import './AdminPages.css';

const AdminQuests = () => {
    const [quests, setQuests] = useState([]);
    const [statistics, setStatistics] = useState(null);
    const [config, setConfig] = useState({ assignmentHour: 10, durationHours: 24 });
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [showConfig, setShowConfig] = useState(false);
    const [selectedTab, setSelectedTab] = useState('quests');

    const [formData, setFormData] = useState({
        id: null,
        name: '',
        description: '',
        secretCode: '',
        points: 50,
        isActive: true
    });

    const [configData, setConfigData] = useState({
        assignmentHour: 10,
        durationHours: 24
    });

    const [isEditing, setIsEditing] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [questsData, statsData, configResult] = await Promise.all([
                questService.getAllQuests(),
                questService.getStatistics(),
                questService.getConfig()
            ]);

            setQuests(questsData);
            setStatistics(statsData);
            setConfig(configResult);
            setConfigData(configResult);
        } catch (error) {
            console.error('Error loading quests data:', error);
            toast.error('Error loading quests data');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({
            ...formData,
            [name]: type === 'checkbox' ? checked : value
        });
    };

    const handleConfigChange = (e) => {
        const { name, value } = e.target;
        setConfigData({
            ...configData,
            [name]: parseInt(value, 10)
        });
    };

    const handleAddQuest = () => {
        setFormData({
            id: null,
            name: '',
            description: '',
            secretCode: '',
            points: 50,
            isActive: true
        });
        setIsEditing(false);
        setShowForm(true);
    };

    const handleEditQuest = (quest) => {
        setFormData({
            id: quest.id,
            name: quest.name,
            description: quest.description || '',
            secretCode: quest.secretCode,
            points: quest.points,
            isActive: quest.isActive
        });
        setIsEditing(true);
        setShowForm(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            setLoading(true);

            if (isEditing) {
                await questService.updateQuest(formData.id, {
                    name: formData.name,
                    description: formData.description,
                    secretCode: formData.secretCode,
                    points: parseInt(formData.points, 10),
                    isActive: formData.isActive
                });
                toast.success('Quest updated successfully');
            } else {
                await questService.createQuest({
                    name: formData.name,
                    description: formData.description,
                    secretCode: formData.secretCode,
                    points: parseInt(formData.points, 10),
                    isActive: formData.isActive
                });
                toast.success('Quest created successfully');
            }

            await fetchData();
            setShowForm(false);
        } catch (error) {
            console.error('Error saving quest:', error);
            toast.error(error.response?.data?.message || 'Error saving quest');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteQuest = async (id) => {
        if (!window.confirm('Are you sure you want to delete this quest?')) {
            return;
        }

        try {
            setLoading(true);
            await questService.deleteQuest(id);
            setQuests(quests.filter(quest => quest.id !== id));
            toast.success('Quest deleted successfully');
        } catch (error) {
            console.error('Error deleting quest:', error);
            toast.error('Error deleting quest');
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateConfig = async (e) => {
        e.preventDefault();

        try {
            setLoading(true);
            await questService.updateConfig(configData);
            setConfig(configData);
            setShowConfig(false);
            toast.success('Configuration updated successfully');
        } catch (error) {
            console.error('Error updating config:', error);
            toast.error(error.response?.data?.message || 'Error updating configuration');
        } finally {
            setLoading(false);
        }
    };

    const handleAssignQuests = async () => {
        if (!window.confirm('Are you sure you want to manually assign daily quests now?')) {
            return;
        }

        try {
            setLoading(true);
            await questService.assignDailyQuests();
            await fetchData();
            toast.success('Daily quests assigned successfully');
        } catch (error) {
            console.error('Error assigning quests:', error);
            toast.error('Error assigning daily quests');
        } finally {
            setLoading(false);
        }
    };

    if (loading && quests.length === 0) {
        return (
            <div className="loading-container">
                <div className="spinner"></div>
                <p>Loading quests data...</p>
            </div>
        );
    }

    return (
        <div className="admin-container">
            <div className="admin-header">
                <h1>Quests Management</h1>
                <div className="admin-controls">
                    <div className="tab-buttons">
                        <button
                            className={`btn-tab ${selectedTab === 'quests' ? 'active' : ''}`}
                            onClick={() => setSelectedTab('quests')}
                        >
                            Quests
                        </button>
                        <button
                            className={`btn-tab ${selectedTab === 'statistics' ? 'active' : ''}`}
                            onClick={() => setSelectedTab('statistics')}
                        >
                            Statistics
                        </button>
                    </div>
                    <div className="add-buttons">
                        <button className="btn-add" onClick={handleAddQuest}>
                            Add Quest
                        </button>
                        <button className="btn-add" onClick={() => setShowConfig(true)}>
                            Configuration
                        </button>
                        <button className="btn-add" onClick={handleAssignQuests}>
                            Assign Now
                        </button>
                    </div>
                </div>
            </div>

            {selectedTab === 'quests' && (
                <>
                    {showForm && (
                        <div className="form-container">
                            <h2>{isEditing ? 'Edit Quest' : 'Add New Quest'}</h2>
                            <form onSubmit={handleSubmit}>
                                <div className="form-group">
                                    <label htmlFor="name">Quest Name *</label>
                                    <input
                                        type="text"
                                        id="name"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        required
                                        maxLength="255"
                                    />
                                </div>

                                <div className="form-group">
                                    <label htmlFor="description">Description</label>
                                    <textarea
                                        id="description"
                                        name="description"
                                        value={formData.description}
                                        onChange={handleChange}
                                        rows="3"
                                        placeholder="Describe what the student needs to do"
                                    ></textarea>
                                </div>

                                <div className="form-group">
                                    <label htmlFor="secretCode">Secret Code *</label>
                                    <input
                                        type="text"
                                        id="secretCode"
                                        name="secretCode"
                                        value={formData.secretCode}
                                        onChange={handleChange}
                                        required
                                        maxLength="100"
                                        placeholder="Code students need to enter"
                                    />
                                </div>

                                <div className="form-group">
                                    <label htmlFor="points">Points *</label>
                                    <input
                                        type="number"
                                        id="points"
                                        name="points"
                                        value={formData.points}
                                        onChange={handleChange}
                                        required
                                        min="1"
                                        max="1000"
                                    />
                                </div>

                                <div className="form-group">
                                    <label>
                                        <input
                                            type="checkbox"
                                            name="isActive"
                                            checked={formData.isActive}
                                            onChange={handleChange}
                                        />
                                        Active (can be assigned to students)
                                    </label>
                                </div>

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

                    {showConfig && (
                        <div className="form-container">
                            <h2>Quest Configuration</h2>
                            <form onSubmit={handleUpdateConfig}>
                                <div className="form-group">
                                    <label htmlFor="assignmentHour">Daily Assignment Hour</label>
                                    <select
                                        id="assignmentHour"
                                        name="assignmentHour"
                                        value={configData.assignmentHour}
                                        onChange={handleConfigChange}
                                    >
                                        {Array.from({ length: 24 }, (_, i) => (
                                            <option key={i} value={i}>
                                                {i.toString().padStart(2, '0')}:00
                                            </option>
                                        ))}
                                    </select>
                                    <small>Time when quests are automatically assigned each day</small>
                                </div>

                                <div className="form-group">
                                    <label htmlFor="durationHours">Quest Duration (hours)</label>
                                    <input
                                        type="number"
                                        id="durationHours"
                                        name="durationHours"
                                        value={configData.durationHours}
                                        onChange={handleConfigChange}
                                        min="1"
                                        max="48"
                                    />
                                    <small>How long students have to complete their quest</small>
                                </div>

                                <div className="form-actions">
                                    <button type="submit" className="btn-save" disabled={loading}>
                                        {loading ? 'Saving...' : 'Save Configuration'}
                                    </button>
                                    <button
                                        type="button"
                                        className="btn-cancel"
                                        onClick={() => setShowConfig(false)}
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
                                    <th>Name</th>
                                    <th>Description</th>
                                    <th>Points</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {quests.map(quest => (
                                    <tr key={quest.id}>
                                        <td className="quest-name">{quest.name}</td>
                                        <td className="quest-description">
                                            {quest.description ? quest.description.substring(0, 100) + (quest.description.length > 100 ? '...' : '') : '-'}
                                        </td>
                                        <td className="quest-points">{quest.points}</td>
                                        <td>
                                            <span className={`status-badge ${quest.isActive ? 'active' : 'inactive'}`}>
                                                {quest.isActive ? 'Active' : 'Inactive'}
                                            </span>
                                        </td>
                                        <td className="actions-cell">
                                            <button
                                                className="btn-edit"
                                                onClick={() => handleEditQuest(quest)}
                                            >
                                                Edit
                                            </button>
                                            <button
                                                className="btn-delete"
                                                onClick={() => handleDeleteQuest(quest.id)}
                                            >
                                                Delete
                                            </button>
                                        </td>
                                    </tr>
                                ))}

                                {quests.length === 0 && (
                                    <tr>
                                        <td colSpan="5" className="empty-message">
                                            No quests have been created yet.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </>
            )}

            {selectedTab === 'statistics' && statistics && (
                <div className="statistics-container">
                    <div className="stats-summary">
                        <div className="stat-card">
                            <h3>Total Quests</h3>
                            <p className="stat-number">{statistics.totalQuests}</p>
                        </div>
                        <div className="stat-card">
                            <h3>Active Quests</h3>
                            <p className="stat-number">{statistics.activeQuests}</p>
                        </div>
                        <div className="stat-card">
                            <h3>Today's Assignments</h3>
                            <p className="stat-number">{statistics.todayAssignments}</p>
                        </div>
                        <div className="stat-card">
                            <h3>Today's Completions</h3>
                            <p className="stat-number">{statistics.todayCompletions}</p>
                        </div>
                    </div>

                    <div className="quest-stats-table">
                        <h3>Quest Performance</h3>
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Quest Name</th>
                                    <th>Points</th>
                                    <th>Times Assigned</th>
                                    <th>Times Completed</th>
                                    <th>Completion Rate</th>
                                </tr>
                            </thead>
                            <tbody>
                                {statistics.questStats.map((quest, index) => (
                                    <tr key={index}>
                                        <td>{quest.name}</td>
                                        <td>{quest.points}</td>
                                        <td>{quest.timesAssigned}</td>
                                        <td>{quest.timesCompleted}</td>
                                        <td>
                                            <span className={`completion-rate ${quest.completionRate > 50 ? 'good' : 'poor'}`}>
                                                {quest.completionRate}%
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="config-info">
                        <h3>Current Configuration</h3>
                        <p><strong>Assignment Time:</strong> {config.assignmentHour.toString().padStart(2, '0')}:00</p>
                        <p><strong>Quest Duration:</strong> {config.durationHours} hours</p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminQuests;
