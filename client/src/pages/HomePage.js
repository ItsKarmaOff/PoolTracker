/**
 * ┌────────────────────────────────────────────────────────────────────────────
 * │ @author                    Christophe Vandevoir
 * ├────────────────────────────────────────────────────────────────────────────
 * │ @file           HomePage.js
 * │ @path          client/src/pages/HomePage.js
 * │ @description   HomePage implementation
 * │ @version       1.0.0
 * │
 * │ @email         christophe.vandevoir@epitech.eu
 * │ @date          2025-04-30
 * ├────────────────────────────────────────────────────────────────────────────
 * │ @copyright     (c) 2025 Christophe Vandevoir
 * └────────────────────────────────────────────────────────────────────────────
 */

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { teamService } from '../services/api';
import { toast } from 'react-toastify';
import './HomePage.css';

const HomePage = () => {
    const [teams, setTeams] = useState([]);
    const [topStudentsByTeam, setTopStudentsByTeam] = useState({});
    const [loading, setLoading] = useState(true);

    // Load teams with their points
    useEffect(() => {
        const fetchTeams = async () => {
            try {
                const teamsData = await teamService.getAllTeamsWithPoints();
                setTeams(teamsData);

                // For each team, load the top 5 students
                const topStudentsData = {};
                for (const team of teamsData) {
                    const students = await teamService.getTopStudents(team.id, 5);
                    topStudentsData[team.id] = students;
                }

                setTopStudentsByTeam(topStudentsData);
            } catch (error) {
                console.error('\x1b[31mError loading data:\x1b[0m', error);
                toast.error('Error loading data');
            } finally {
                setLoading(false);
            }
        };

        fetchTeams();
    }, []);

    if (loading) {
        return (
            <div className="loading-container">
                <div className="spinner"></div>
                <p>loading data...</p>
            </div>
        );
    }

    return (
        <div className="home-container">
            <h1>Pool Tracker - Score Board</h1>

            <section className="teams-section">
                <h2>Team Rankings</h2>
                <div className="teams-grid">
                    {teams.map(team => (
                        <div key={team.id} className={`team-card team-card-${team.color || 'none'}`}>
                            <h3 className={`team-name team-color-${team.color || 'none'}`}>{team.name}</h3>
                            <p className="team-description">{team.description}</p>
                            <p className="team-points">
                                <strong className={`team-points team-color-${team.totalPoints >= 0 ? 'green' : 'red'}`}>{team.totalPoints} points</strong>
                            </p>

                            <h4>Top 5 Students</h4>
                            <ul className="top-students-list">
                                {topStudentsByTeam[team.id]?.length > 0 ? (
                                    topStudentsByTeam[team.id].map(student => (
                                        <li key={student.id} className="student-item">
                                            <span className="student-name">
                                                {student.firstName} {student.lastName}
                                            </span>
                                            <span className={`student-points team-color-${student.totalPoints >= 0 ? 'green' : 'red'}`}>{student.totalPoints ?? 0} pts</span>
                                        </li>
                                    ))
                                ) : (
                                    <li className="empty-message">No students in this team</li>
                                )}
                            </ul>

                            <Link to={`/teams/${team.id}`} className="view-details-btn">
                                View details
                            </Link>
                        </div>
                    ))}

                    {teams.length === 0 && (
                        <div className="empty-message-container">
                            <p>No teams have been created yet.</p>
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
};

export default HomePage;
