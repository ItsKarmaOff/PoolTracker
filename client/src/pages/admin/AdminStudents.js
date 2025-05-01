
/**
 * ┌────────────────────────────────────────────────────────────────────────────
 * │ @author                    Christophe Vandevoir
 * ├────────────────────────────────────────────────────────────────────────────
 * │ @file           AdminStudents.js
 * │ @path          client/src/pages/admin/AdminStudents.js
 * │ @description   AdminStudents implementation
 * │ @version       1.0.0
 * │
 * │ @email         christophe.vandevoir@epitech.eu
 * │ @date          2025-05-01
 * ├────────────────────────────────────────────────────────────────────────────
 * │ @copyright     (c) 2025 Christophe Vandevoir
 * └────────────────────────────────────────────────────────────────────────────
 */

import React, { useState, useEffect } from 'react';
import { studentService, teamService } from '../../services/api';
import { toast } from 'react-toastify';
import './AdminPages.css';

const AdminStudents = () => {
    const [students, setStudents] = useState([]);
    const [teams, setTeams] = useState([]);
    const [loading, setLoading] = useState(true);

    const [formData, setFormData] = useState({
        id: null,
        email: '',
        firstName: '',
        lastName: '',
        teamId: ''
    });

    const [showForm, setShowForm] = useState(false);
    const [isEditing, setIsEditing] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [studentsData, teamsData] = await Promise.all([
                    studentService.getAllStudents(),
                    teamService.getAllTeams()
                ]);

                setStudents(studentsData);
                setTeams(teamsData);
            } catch (error) {
                console.error('\x1b[31mError loading data:\x1b[0m', error);
                toast.error('Error loading data');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
    };

    const handleAddStudent = () => {
        setFormData({
            id: null,
            email: '',
            firstName: '',
            lastName: '',
            teamId: ''
        });
        setIsEditing(false);
        setShowForm(true);
    };

    const handleEditStudent = (student) => {
        setFormData({
            id: student.id,
            email: student.email,
            firstName: student.firstName || '',
            lastName: student.lastName || '',
            teamId: ''
        });
        setIsEditing(true);
        setShowForm(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            setLoading(true);

            if (isEditing) {
                await studentService.updateStudent(formData.id, {
                    email: formData.email,
                    firstName: formData.firstName,
                    lastName: formData.lastName
                });

                if (formData.teamId) {
                    await teamService.addStudentToTeam(formData.teamId, formData.id);
                }

                toast.success('Student updated successfully');
            } else {
                const result = await studentService.createStudent({
                    email: formData.email,
                    firstName: formData.firstName,
                    lastName: formData.lastName
                });

                if (formData.teamId && result.student?.id) {
                    await teamService.addStudentToTeam(formData.teamId, result.student.id);
                }

                toast.success('Student updated successfully');
            }

            const updatedStudents = await studentService.getAllStudents();
            setStudents(updatedStudents);

            setShowForm(false);
            setFormData({
                id: null,
                email: '',
                firstName: '',
                lastName: '',
                teamId: ''
            });
        } catch (error) {
            console.error('\x1b[31mError during save:\x1b[0m', error);
            toast.error(error.response?.data?.message || 'Error during save');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteStudent = async (id) => {
        if (!window.confirm('Are you sure you want to delete this student?')) {
            return;
        }

        try {
            setLoading(true);
            await studentService.deleteStudent(id);

            setStudents(students.filter(student => student.id !== id));

            toast.success('Student deleted successfully');
        } catch (error) {
            console.error('\x1b[31mError during deletion:\x1b[0m', error);
            toast.error('Error deleting student');
        } finally {
            setLoading(false);
        }
    };

    if (loading && students.length === 0) {
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
                <h1>Student Management</h1>
                <button className="btn-add" onClick={handleAddStudent}>
                    Add a student
                </button>
            </div>

            {showForm && (
                <div className="form-container">
                    <h2>{isEditing ? 'Edit Student' : 'Add Student'}</h2>
                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label htmlFor="email">Email *</label>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="firstName">First Name</label>
                            <input
                                type="text"
                                id="firstName"
                                name="firstName"
                                value={formData.firstName}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="lastName">Last Name</label>
                            <input
                                type="text"
                                id="lastName"
                                name="lastName"
                                value={formData.lastName}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="teamId">Team</label>
                            <select
                                id="teamId"
                                name="teamId"
                                value={formData.teamId}
                                onChange={handleChange}
                            >
                                <option value="">-- Not assigned --</option>
                                {teams.map(team => (
                                    <option key={team.id} value={team.id}>
                                        {team.name}
                                    </option>
                                ))}
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

            <div className="table-container">
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>Email</th>
                            <th>First Name</th>
                            <th>Last Name</th>
                            <th>Created At</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {students.map(student => (
                            <tr key={student.id}>
                                <td>{student.email}</td>
                                <td>{student.firstName || '-'}</td>
                                <td>{student.lastName || '-'}</td>
                                <td>{new Date(student.createdAt).toLocaleDateString('fr-FR')}</td>
                                <td className="actions-cell">
                                    <button
                                        className="btn-edit"
                                        onClick={() => handleEditStudent(student)}
                                    >
                                        Edit
                                    </button>
                                    <button
                                        className="btn-delete"
                                        onClick={() => handleDeleteStudent(student.id)}
                                    >
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        ))}

                        {students.length === 0 && (
                            <tr>
                                <td colSpan="5" className="empty-message">
                                    No students have been created yet.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AdminStudents;
