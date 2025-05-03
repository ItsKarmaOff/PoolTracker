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
    const [showPopup, setShowPopup] = useState(false);
    const [popupPosition, setPopupPosition] = useState({ top: 0, left: 0 });
    const [pointAction, setPointAction] = useState('add');

    const [formData, setFormData] = useState({
        value: 0,
        reason: ''
    });

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

    const handleAddPoints = (student, event) => {
        setSelectedStudent(student);
        setPointAction('add');
        setFormData({
            value: 1, // Default to positive value
            reason: ''
        });

        // Calculate popup position
        const rect = event.target.getBoundingClientRect();
        setPopupPosition({
            top: window.scrollY + rect.bottom + 10,
            left: window.scrollX + rect.left
        });

        setShowPopup(true);
    };

    const handleRemovePoints = (student, event) => {
        setSelectedStudent(student);
        setPointAction('remove');
        setFormData({
            value: 1,
            reason: ''
        });

        // Calculate popup position
        const rect = event.target.getBoundingClientRect();
        setPopupPosition({
            top: window.scrollY + rect.bottom + 10,
            left: window.scrollX + rect.left
        });

        setShowPopup(true);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: name === 'value' ? Math.abs(parseInt(value, 10)) || 0 : value
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

            const pointValue = pointAction === 'add' ? formData.value : -formData.value;

            await pointService.addPoints({
                userId: selectedStudent.id,
                value: pointValue,
                reason: formData.reason
            });

            const updatedSummary = await pointService.getAllStudentsPointsSummary();
            setPointsSummary(updatedSummary);

            toast.success(
                pointAction === 'add'
                    ? `${formData.value} points added to ${selectedStudent.firstName} ${selectedStudent.lastName}`
                    : `${formData.value} points removed from ${selectedStudent.firstName} ${selectedStudent.lastName}`
            );

            setShowPopup(false);
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
        setShowPopup(false);
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

            <div className="students-summary">
                <h2>Points Summary Table</h2>
                <div className="table-container">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>First Name</th>
                                <th>Last Name</th>
                                <th>Email</th>
                                <th>Team</th>
                                <th>Points</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {pointsSummary.map(student => (
                                <tr key={student.id}>
                                    <td>{student.firstName || '-'}</td>
                                    <td>{student.lastName || '-'}</td>
                                    <td>{student.email}</td>
                                    <td>{student.teamName || '-'}</td>
                                    <td className={student.totalPoints >= 0 ? 'positive' : 'negative'}>
                                        {student.totalPoints}
                                    </td>
                                    <td className="actions-cell">
                                        <button
                                            className="btn-add points-btn"
                                            onClick={(e) => handleAddPoints(student, e)}
                                        >
                                            Add points
                                        </button>
                                        <button
                                            className="btn-delete points-btn"
                                            onClick={(e) => handleRemovePoints(student, e)}
                                        >
                                            Remove points
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

            {showPopup && selectedStudent && (
                <div className="points-popup" style={{ top: `${popupPosition.top}px`, left: `${popupPosition.left}px` }}>
                    <div className="points-form">
                        <h2>
                            {pointAction === 'add' ? 'Add points' : 'Remove points'}
                        </h2>
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
                                    min="1"
                                    required
                                />
                                <small>
                                    {pointAction === 'add'
                                        ? 'Enter the number of points to add.'
                                        : 'Enter the number of points to remove.'}
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
                                    placeholder={`Explain why you are ${pointAction === 'add' ? 'adding' : 'removing'} points`}
                                ></textarea>
                            </div>

                            <div className="form-actions">
                                <button type="submit" className={`btn-save ${pointAction === 'add' ? 'btn-add-points' : 'btn-remove-points'}`} disabled={loading}>
                                    {loading ? 'Processing...' : pointAction === 'add' ? 'Add points' : 'Remove points'}
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
                </div>
            )}
        </div>
    );
};

export default AdminPoints;
