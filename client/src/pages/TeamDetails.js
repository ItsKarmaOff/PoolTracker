/**
 * ┌────────────────────────────────────────────────────────────────────────────
 * │ @author                    Christophe Vandevoir
 * ├────────────────────────────────────────────────────────────────────────────
 * │ @file           TeamDetails.js
 * │ @path          client/src/pages/TeamDetails.js
 * │ @description   TeamDetails implementation
 * │ @version       1.0.0
 * │
 * │ @email         christophe.vandevoir@epitech.eu
 * │ @date          2025-05-01
 * ├────────────────────────────────────────────────────────────────────────────
 * │ @copyright     (c) 2025 Christophe Vandevoir
 * └────────────────────────────────────────────────────────────────────────────
 */

import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { teamService } from '../services/api';
import { toast } from 'react-toastify';
import './TeamDetails.css';

const TeamDetails = () => {
    const { id } = useParams();
    const [team, setTeam] = useState(null);
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTeamData = async () => {
            try {
                setLoading(true);
                const teamData = await teamService.getTeamById(id);
                setTeam(teamData);

                // Get the list of students for the team
                const studentsData = await teamService.getTeamStudents(id);
                setStudents(studentsData);
            } catch (error) {
                console.error('\x1b[31mError loading team data:\x1b[0m', error);
                toast.error('Error loading team data');
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchTeamData();
        }
    }, [id]);

    if (loading) {
        return (
            <div className="loading-container">
                <div className="spinner"></div>
                <p>Loading data...</p>
            </div>
        );
    }

    if (!team) {
        return (
            <div className="error-container">
                <h2>Team not found</h2>
                <p>The team you are looking for does not exist or has been deleted.</p>
                <Link to="/" className="btn-back">Back to home</Link>
            </div>
        );
    }

    // Formater la date
    const formatDate = (dateString) => {
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(dateString).toLocaleDateString('fr-FR', options);
    };

    return (
        <div className="team-details-container">
            <div className="team-header">
                <Link to="/" className="btn-back">
                    &larr; Back
                </Link>
                <h1 className={`team-color-${team.color || 'none'}`}>{team.name}</h1>
                <div className="team-meta">
                    <p className="team-description">{team.description || 'No description'}</p>
                    <p className="team-creation-date">
                        Created at {formatDate(team.createdAt)}
                    </p>
                </div>
                <div className="team-points-display">
                    <span className="points-value">{team.totalPoints}</span>
                    <span className="points-label">Total Points</span>
                </div>
            </div>

            <div className="students-section">
                <h2>Team Members</h2>

                {students.length > 0 ? (
                    <div className="students-table-container">
                        <table className="students-table">
                            <thead>
                                <tr>
                                    <th>First Name</th>
                                    <th>Last Name</th>
                                    <th>Email</th>
                                    <th>Points</th>
                                </tr>
                            </thead>
                            <tbody>
                                {students.map((student) => (
                                    <tr key={student.id}>
                                        <td>{student.firstName || '-'}</td>
                                        <td>{student.lastName || '-'}</td>
                                        <td>{student.email}</td>
                                        <td className={student.totalPoints >= 0 ? 'positive' : 'negative'}>
                                            {student.totalPoints}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="empty-message">
                        <p>No students are assigned to this team.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default TeamDetails;
