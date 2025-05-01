/**
 * ┌────────────────────────────────────────────────────────────────────────────
 * │ @author                    Christophe Vandevoir
 * ├────────────────────────────────────────────────────────────────────────────
 * │ @file           AdminPoints.js
 * │ @path          client/src/pages/admin/AdminPoints.js
 * │ @description   AdminPoints implementation
 * │ @version       1.0.0
 * │
 * │ @email         christophe.vandevoir@epitech.eu
 * │ @date          2025-05-01
 * ├────────────────────────────────────────────────────────────────────────────
 * │ @copyright     (c) 2025 Christophe Vandevoir
 * └────────────────────────────────────────────────────────────────────────────
 */

import React, { useState, useEffect } from 'react';
import { pointService, studentService } from '../../services/api';
import { toast } from 'react-toastify';
import './AdminPages.css';

const AdminPoints = () => {
    const [students, setStudents] = useState([]);
    const [pointsSummary, setPointsSummary] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedStudent, setSelectedStudent] = useState(null);

    const [formData, setFormData] = useState({
        value: 0,
        reason: ''
    });

    const [showForm, setShowForm] = useState(false);

    useEffect(() => {
        const fetchPointsSummary = async () => {
            try {
                const summary = await pointService.getAllStudentsPointsSummary();
                setPointsSummary(summary);
            } catch (error) {
                console.error('\x1b[31mError loading points summary:\x1b[0m', error);
                toast.error('Error loading points summary');
            } finally {
                setLoading(false);
            }
        };

        fetchPointsSummary();
    }, []);

    const handleSelectStudent = (student) => {
        setSelectedStudent(student);
        setFormData({
            value: 0,
            reason: ''
        });
        setShowForm(true);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: name === 'value' ? parseInt(value, 10) || 0 : value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!selectedStudent) {
            toast.error('No student selected');
            return;
        }

        if (formData.value === 0) {
            toast.error('Point value cannot be zero');
            return;
        }

        try {
            setLoading(true);

            await pointService.addPoints({
                userId: selectedStudent.id,
                value: formData.value,
                reason: formData.reason
            });

            const updatedSummary = await pointService.getAllStudentsPointsSummary();
            setPointsSummary(updatedSummary);

            toast.success(
                formData.value > 0
                    ? `${formData.value} points added to ${selectedStudent.firstName} ${selectedStudent.lastName}`
                    : `${Math.abs(formData.value)} points removed from ${selectedStudent.firstName} ${selectedStudent.lastName}`
            );

            setShowForm(false);
            setSelectedStudent(null);
            setFormData({
                value: 0,
                reason: ''
            });
        } catch (error) {
            console.error('\x1b[31mError adding/removing points:\x1b[0m', error);
            toast.error('Error adding/removing points');
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        setShowForm(false);
        setSelectedStudent(null);
        setFormData({
            value: 0,
            reason: ''
        });
    };

    if (loading && pointsSummary.length === 0) {
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
                <h1>Points Management</h1>
            </div>

            <div className="admin-grid">
                <div className="students-summary">
                    <h2>Points Summary Table</h2>
                    <div className="table-container">
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Last Name</th>
                                    <th>First Name</th>
                                    <th>Email</th>
                                    <th>Team</th>
                                    <th>Points</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {pointsSummary.map(student => (
                                    <tr key={student.id}>
                                        <td>{student.lastName || '-'}</td>
                                        <td>{student.firstName || '-'}</td>
                                        <td>{student.email}</td>
                                        <td>{student.teamName || '-'}</td>
                                        <td className={student.totalPoints >= 0 ? 'positive' : 'negative'}>
                                            {student.totalPoints}
                                        </td>
                                        <td className="actions-cell">
                                            <button
                                                className="btn-edit"
                                                onClick={() => handleSelectStudent(student)}
                                            >
                                                Add/Remove points
                                            </button>
                                        </td>
                                    </tr>
                                ))}

                                {pointsSummary.length === 0 && (
                                    <tr>
                                        <td colSpan="6" className="empty-message">
                                            No students have been created yet.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {showForm && selectedStudent && (
                    <div className="points-form">
                        <h2>Add/Remove points</h2>
                        <div className="selected-student-info">
                            <p>
                                <strong>Student:</strong> {selectedStudent.firstName} {selectedStudent.lastName}
                            </p>
                            <p>
                                <strong>Email:</strong> {selectedStudent.email}
                            </p>
                            <p>
                                <strong>Current points:</strong> {selectedStudent.totalPoints}
                            </p>
                        </div>

                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label htmlFor="value">Points value *</label>
                                <input
                                    type="number"
                                    id="value"
                                    name="value"
                                    value={formData.value}
                                    onChange={handleChange}
                                    required
                                />
                                <small>
                                    Positive value to add points, negative value to remove them.
                                </small>
                            </div>

                            <div className="form-group">
                                <label htmlFor="reason">Reason</label>
                                <textarea
                                    id="reason"
                                    name="reason"
                                    value={formData.reason}
                                    onChange={handleChange}
                                    rows="3"
                                    placeholder="Explain why you are adding/removing points"
                                ></textarea>
                            </div>

                            <div className="form-actions">
                                <button type="submit" className="btn-save" disabled={loading}>
                                    {loading ? 'Saving...' : 'Saved'}
                                </button>
                                <button
                                    type="button"
                                    className="btn-cancel"
                                    onClick={handleCancel}
                                    disabled={loading}
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminPoints;
