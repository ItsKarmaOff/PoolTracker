/**
 * ┌────────────────────────────────────────────────────────────────────────────
 * │ @author                    Christophe Vandevoir
 * ├────────────────────────────────────────────────────────────────────────────
 * │ @file           AdminTeams.js
 * │ @path          client/src/pages/admin/AdminTeams.js
 * │ @description   AdminTeams implementation
 * │ @version       1.0.0
 * │
 * │ @email         christophe.vandevoir@epitech.eu
 * │ @date          2025-05-01
 * ├────────────────────────────────────────────────────────────────────────────
 * │ @copyright     (c) 2025 Christophe Vandevoir
 * └────────────────────────────────────────────────────────────────────────────
 */

import React, { useState, useEffect } from 'react';
import { teamService } from '../../services/api';
import { toast } from 'react-toastify';
import './AdminPages.css';

const AdminTeams = () => {
    const [teams, setTeams] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedTeam, setSelectedTeam] = useState(null);
    const [teamStudents, setTeamStudents] = useState([]);

    const [formData, setFormData] = useState({
        id: null,
        name: '',
        description: '',
        color: 'none'
    });

    const [showForm, setShowForm] = useState(false);
    const [isEditing, setIsEditing] = useState(false);

    useEffect(() => {
        const fetchTeams = async () => {
            try {
                const teamsData = await teamService.getAllTeamsWithPoints();
                setTeams(teamsData);
            } catch (error) {
                console.error('\x1b[31mError loading teams:\x1b[0m', error);
                toast.error('Error loading teams');
            } finally {
                setLoading(false);
            }
        };

        fetchTeams();
    }, []);

    useEffect(() => {
        const fetchTeamStudents = async () => {
            if (!selectedTeam) return;

            try {
                setLoading(true);
                const students = await teamService.getTeamStudents(selectedTeam.id);
                setTeamStudents(students);
            } catch (error) {
                console.error('\x1b[31mError loading team students:\x1b[0m', error);
                toast.error('Error loading team students');
            } finally {
                setLoading(false);
            }
        };

        fetchTeamStudents();
    }, [selectedTeam]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
    };

    const handleAddTeam = () => {
        setFormData({
            id: null,
            name: '',
            description: '',
            color: 'none'
        });
        setIsEditing(false);
        setShowForm(true);
    };

    const handleEditTeam = (team) => {
        setFormData({
            id: team.id,
            name: team.name,
            description: team.description || '',
            color: team.color || 'none'
        });
        setIsEditing(true);
        setShowForm(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            setLoading(true);

            if (isEditing) {
                await teamService.updateTeam(formData.id, {
                    name: formData.name,
                    description: formData.description,
                    color: formData.color
                });

                toast.success('Team updated successfully');
            } else {
                await teamService.createTeam({
                    name: formData.name,
                    description: formData.description,
                    color: formData.color
                });

                toast.success('Team created successfully');
            }

            const updatedTeams = await teamService.getAllTeamsWithPoints();
            setTeams(updatedTeams);

            if (selectedTeam && selectedTeam.id === formData.id) {
                const updatedTeam = updatedTeams.find(team => team.id === formData.id);
                setSelectedTeam(updatedTeam);
            }

            setShowForm(false);
            setFormData({
                id: null,
                name: '',
                description: ''
            });
        } catch (error) {
            console.error('\x1b[31mError during save:\x1b[0m', error);
            toast.error(error.response?.data?.message || 'Error during save');
        } finally {
            setLoading(false);
        }
    };

    // Supprimer une équipe
    const handleDeleteTeam = async (id) => {
        if (!window.confirm('Are you sure you want to delete this team?')) {
            return;
        }

        try {
            setLoading(true);
            await teamService.deleteTeam(id);

            setTeams(teams.filter(team => team.id !== id));

            if (selectedTeam && selectedTeam.id === id) {
                setSelectedTeam(null);
                setTeamStudents([]);
            }

            toast.success('Team deleted successfully');
        } catch (error) {
            console.error('\x1b[31mError deleting team:\x1b[0m', error);
            toast.error('Error deleting team');
        } finally {
            setLoading(false);
        }
    };

    const handleSelectTeam = (team) => {
        setSelectedTeam(team);
    };

    const handleRemoveStudent = async (studentId) => {
        if (!selectedTeam) return;

        if (!window.confirm('Are you sure you want to remove this student from the team?')) {
            return;
        }

        try {
            setLoading(true);
            await teamService.removeStudentFromTeam(selectedTeam.id, studentId);

            setTeamStudents(teamStudents.filter(student => student.id !== studentId));

            toast.success('Student successfully removed from the team');
        } catch (error) {
            console.error('\x1b[31mError removing student from team:\x1b[0m', error);
            toast.error('Error removing student from team');
        } finally {
            setLoading(false);
        }
    };

    if (loading && teams.length === 0) {
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
                <h1>Teams Management</h1>
                <button className="btn-add" onClick={handleAddTeam}>
                    Add a team
                </button>
            </div>

            {showForm && (
                <div className="form-container">
                    <h2>{isEditing ? 'Modifier une équipe' : 'Ajouter une équipe'}</h2>
                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label htmlFor="name">Team Name *</label>
                            <input
                                type="text"
                                id="name"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                required
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
                            ></textarea>
                        </div>

                        <div className="form-group">
                            <label htmlFor="color">Color</label>
                            <select
                                id="color"
                                name="color"
                                value={formData.color}
                                onChange={handleChange}
                                className={`color-select color-select-${formData.color}`}
                            >
                                <option value="none">None</option>
                                <option value="red">Red</option>
                                <option value="green">Green</option>
                                <option value="blue">Blue</option>
                                <option value="yellow">Yellow</option>
                            </select>
                        </div>

                        <div className="form-actions">
                            <button type="submit" className="btn-save" disabled={loading}>
                                {loading ? 'Saving...' : 'Saved'}
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

            <div className="admin-grid">
                <div className="teams-list">
                    <h2>Team List</h2>
                    <div className="table-container">
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Color</th>
                                    <th>Points</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {teams.map(team => (
                                    <tr
                                        key={team.id}
                                        className={selectedTeam && selectedTeam.id === team.id ? 'selected-row' : ''}
                                        onClick={() => handleSelectTeam(team)}
                                    >
                                        <td className={`team-name team-color-${team.color || 'none'}`}>{team.name}</td>
                                        <td>
                                            <span className={`color-dot color-dot-${team.color || 'none'}`}></span>
                                            {team.color === 'red' ? 'Red' :
                                                team.color === 'green' ? 'Green' :
                                                    team.color === 'blue' ? 'Blue' :
                                                        team.color === 'yellow' ? 'Yellow' : 'Aucune'}
                                        </td>
                                        <td>{team.totalPoints}</td>
                                        <td className="actions-cell">
                                            <button
                                                className="btn-edit"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleEditTeam(team);
                                                }}
                                            >
                                                Edit
                                            </button>
                                            <button
                                                className="btn-delete"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleDeleteTeam(team.id);
                                                }}
                                            >
                                                Delete
                                            </button>
                                        </td>
                                    </tr>
                                ))}

                                {teams.length === 0 && (
                                    <tr>
                                        <td colSpan="3" className="empty-message">
                                            No teams have been created yet.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="team-students">
                    <h2>
                        {selectedTeam
                            ? `Students of the team: ${selectedTeam.name}`
                            : 'Select a team to view its students'}
                    </h2>

                    {selectedTeam ? (
                        <div className="table-container">
                            <table className="data-table">
                                <thead>
                                    <tr>
                                        <th>First Name</th>
                                        <th>Last Name</th>
                                        <th>Email</th>
                                        <th>Points</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {teamStudents.map(student => (
                                        <tr key={student.id}>
                                            <td>{student.firstName || '-'}</td>
                                            <td>{student.lastName || '-'}</td>
                                            <td>{student.email}</td>
                                            <td>{student.totalPoints}</td>
                                            <td className="actions-cell">
                                                <button
                                                    className="btn-delete"
                                                    onClick={() => handleRemoveStudent(student.id)}
                                                >
                                                    Remove
                                                </button>
                                            </td>
                                        </tr>
                                    ))}

                                    {teamStudents.length === 0 && (
                                        <tr>
                                            <td colSpan="5" className="empty-message">
                                                No students in this team.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="empty-selection-message">
                            <p>Click on a team to view its students.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminTeams;
