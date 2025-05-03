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

import React, { useState, useEffect, useRef } from 'react';
import { studentService, teamService } from '../../services/api';
import { toast } from 'react-toastify';
import './AdminPages.css';

const AdminStudents = () => {
    const [students, setStudents] = useState([]);
    const [teams, setTeams] = useState([]);
    const [loading, setLoading] = useState(true);
    const [csvLoading, setCsvLoading] = useState(false);
    const fileInputRef = useRef(null);

    const [formData, setFormData] = useState({
        id: null,
        email: '',
        firstName: '',
        lastName: '',
        teamId: ''
    });

    const [showForm, setShowForm] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [showCsvImport, setShowCsvImport] = useState(false);

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
        setShowCsvImport(false);
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
        setShowCsvImport(false);
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

                toast.success('Student created successfully');
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

    const handleShowCsvImport = () => {
        setShowCsvImport(true);
        setShowForm(false);
    };

    const handleCsvFileChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (file.type !== 'text/csv' && !file.name.endsWith('.csv')) {
            toast.error('Please upload a CSV file');
            if (fileInputRef.current) {
                fileInputRef.current.value = null;
            }
            return;
        }

        // Continue with CSV processing
        const reader = new FileReader();
        reader.onload = handleCsvLoad;
        reader.readAsText(file);
    };

    const handleCsvLoad = async (e) => {
        try {
            setCsvLoading(true);
            const csvContent = e.target.result;

            // Parse CSV
            const rows = csvContent.split('\n');
            // Remove any empty rows
            const filteredRows = rows.filter(row => row.trim() !== '');

            // Extract header and check required fields
            const headers = filteredRows[0].split(';').map(h => h.trim().toLowerCase());

            // Check if email column exists
            const emailIndex = headers.findIndex(h => h === 'email');
            if (emailIndex === -1) {
                toast.error('CSV must contain an "email" column');
                setCsvLoading(false);
                return;
            }

            // Get indices for optional fields
            const firstNameIndex = headers.findIndex(h => h === 'firstname' || h === 'first_name' || h === 'first name');
            const lastNameIndex = headers.findIndex(h => h === 'lastname' || h === 'last_name' || h === 'last name');
            const teamIndex = headers.findIndex(h => h === 'team' || h === 'teamname' || h === 'team_name' || h === 'team name');

            // Process data rows
            const studentsToCreate = [];
            const errors = [];

            for (let i = 1; i < filteredRows.length; i++) {
                const values = filteredRows[i].split(';').map(v => v.trim());

                // Skip rows with invalid format
                if (values.length < headers.length) {
                    errors.push(`Row ${i + 1}: Invalid format`);
                    continue;
                }

                const email = values[emailIndex];
                if (!email || !email.includes('@')) {
                    errors.push(`Row ${i + 1}: Invalid email "${email}"`);
                    continue;
                }

                const studentData = {
                    email,
                    firstName: firstNameIndex !== -1 ? values[firstNameIndex] : '',
                    lastName: lastNameIndex !== -1 ? values[lastNameIndex] : '',
                    teamName: teamIndex !== -1 ? values[teamIndex] : ''
                };

                studentsToCreate.push(studentData);
            }

            // Show validation errors if any
            if (errors.length > 0) {
                toast.error(`CSV validation errors: ${errors.length}`);
                console.error('CSV validation errors:', errors);
                // If there are too many errors, just show the first few
                if (errors.length > 3) {
                    toast.error(`${errors[0]}, ${errors[1]}, ${errors[2]}, and ${errors.length - 3} more...`);
                } else {
                    errors.forEach(err => toast.error(err));
                }

                if (studentsToCreate.length === 0) {
                    setCsvLoading(false);
                    return;
                }
            }

            // Confirm import
            if (!window.confirm(`Ready to import ${studentsToCreate.length} students. Continue?`)) {
                setCsvLoading(false);
                return;
            }

            // Create students one by one
            let successCount = 0;
            let errorCount = 0;

            for (const student of studentsToCreate) {
                try {
                    // Create student
                    const result = await studentService.createStudent({
                        email: student.email,
                        firstName: student.firstName,
                        lastName: student.lastName
                    });

                    // Assign to team if specified
                    if (student.teamName && result.student?.id) {
                        // Find team by name
                        const team = teams.find(t => t.name.toLowerCase() === student.teamName.toLowerCase());
                        if (team) {
                            await teamService.addStudentToTeam(team.id, result.student.id);
                        } else {
                            console.warn(`Team "${student.teamName}" not found for student ${student.email}`);
                        }
                    }

                    successCount++;
                } catch (error) {
                    errorCount++;
                    console.error(`Error creating student ${student.email}:`, error);
                }
            }

            // Update student list
            const updatedStudents = await studentService.getAllStudents();
            setStudents(updatedStudents);

            // Show final results
            toast.success(`Successfully imported ${successCount} students`);
            if (errorCount > 0) {
                toast.error(`Failed to import ${errorCount} students. Check console for details.`);
            }

            // Reset file input
            if (fileInputRef.current) {
                fileInputRef.current.value = null;
            }

            setShowCsvImport(false);
        } catch (error) {
            console.error('\x1b[31mError processing CSV:\x1b[0m', error);
            toast.error('Error processing CSV file');
        } finally {
            setCsvLoading(false);
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
                <div className="add-buttons">
                    <button className="btn-add" onClick={handleAddStudent}>
                        Add a student
                    </button>
                    <button className="btn-add" onClick={handleShowCsvImport}>
                        Import from CSV
                    </button>
                </div>
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

            {showCsvImport && (
                <div className="form-container">
                    <h2>Import Students from CSV</h2>
                    <div className="csv-import-instructions">
                        <p>Upload a CSV file with the following columns:</p>
                        <ul>
                            <li><strong>email</strong> (required): Student email address</li>
                            <li><strong>firstname</strong> or <strong>first_name</strong> (optional): Student first name</li>
                            <li><strong>lastname</strong> or <strong>last_name</strong> (optional): Student last name</li>
                            <li><strong>team</strong> or <strong>team_name</strong> (optional): Team name to assign</li>
                        </ul>
                        <p>Example CSV format:</p>
                        <pre>email;firstname;lastname;team
                            john.doe@epitech.eu;John;Doe;Red Team
                            jane.smith@epitech.eu;Jane;Smith;Blue Team</pre>
                    </div>

                    <div className="form-group">
                        <label htmlFor="csvFile">Select CSV File</label>
                        <input
                            type="file"
                            id="csvFile"
                            accept=".csv"
                            onChange={handleCsvFileChange}
                            ref={fileInputRef}
                            disabled={csvLoading}
                        />
                    </div>

                    <div className="form-actions">
                        <button
                            type="button"
                            className="btn-cancel"
                            onClick={() => setShowCsvImport(false)}
                            disabled={csvLoading}
                        >
                            Cancel
                        </button>
                    </div>

                    {csvLoading && (
                        <div className="csv-loading">
                            <div className="spinner"></div>
                            <p>Processing CSV...</p>
                        </div>
                    )}
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
