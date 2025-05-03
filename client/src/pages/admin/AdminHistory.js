/**
 * ┌────────────────────────────────────────────────────────────────────────────
 * │ @author                    Christophe Vandevoir
 * ├────────────────────────────────────────────────────────────────────────────
 * │ @file           AdminHistory.js
 * │ @path          client/src/pages/admin/AdminHistory.js
 * │ @description   Admin history page for points transactions
 * │ @version       1.0.0
 * │
 * │ @email         christophe.vandevoir@epitech.eu
 * │ @date          2025-05-03
 * ├────────────────────────────────────────────────────────────────────────────
 * │ @copyright     (c) 2025 Christophe Vandevoir
 * └────────────────────────────────────────────────────────────────────────────
 */

import React, { useState, useEffect } from 'react';
import { pointService } from '../../services/api';
import { toast } from 'react-toastify';
import './AdminPages.css';

const AdminHistory = () => {
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all'); // 'all', 'positive', 'negative'
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(20);

    useEffect(() => {
        fetchPointsHistory();
    }, []);

    const fetchPointsHistory = async () => {
        try {
            setLoading(true);
            const data = await pointService.getAllPointsHistory();
            setHistory(data);
        } catch (error) {
            console.error('\x1b[31mError loading points history:\x1b[0m', error);
            toast.error('Error loading points history');
        } finally {
            setLoading(false);
        }
    };

    // Format date
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

    // Filter history based on current filter and search term
    const filteredHistory = history.filter(entry => {
        // Apply points filter
        if (filter === 'positive' && entry.value <= 0) return false;
        if (filter === 'negative' && entry.value >= 0) return false;

        // Apply search term filter
        const searchTermLower = searchTerm.toLowerCase();
        return (
            entry.studentFirstName?.toLowerCase().includes(searchTermLower) ||
            entry.studentLastName?.toLowerCase().includes(searchTermLower) ||
            entry.studentEmail.toLowerCase().includes(searchTermLower) ||
            entry.adminFirstName?.toLowerCase().includes(searchTermLower) ||
            entry.adminLastName?.toLowerCase().includes(searchTermLower) ||
            entry.reason?.toLowerCase().includes(searchTermLower)
        );
    });

    // Pagination
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredHistory.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredHistory.length / itemsPerPage);

    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
        // Scroll to top when changing page
        window.scrollTo(0, 0);
    };

    const handleFilterChange = (e) => {
        setFilter(e.target.value);
        setCurrentPage(1);
    };

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
        setCurrentPage(1);
    };

    if (loading && history.length === 0) {
        return (
            <div className="loading-container">
                <div className="spinner"></div>
                <p>Loading history data...</p>
            </div>
        );
    }

    return (
        <div className="admin-container">
            <div className="admin-header">
                <h1>Points History</h1>
                <div className="admin-controls">
                    <select
                        value={filter}
                        onChange={handleFilterChange}
                        className="filter-select"
                    >
                        <option value="all">All Actions</option>
                        <option value="positive">Added Points</option>
                        <option value="negative">Removed Points</option>
                    </select>
                    <div className="search-box">
                        <input
                            type="text"
                            placeholder="Search students, admins, reasons..."
                            value={searchTerm}
                            onChange={handleSearchChange}
                            className="search-input"
                        />
                    </div>
                </div>
            </div>

            <div className="history-summary">
                <div className="summary-box">
                    <p>
                        <strong>Total Actions:</strong> {filteredHistory.length}
                    </p>
                    <p>
                        <strong>Points Added:</strong> <span className="positive">
                            {filteredHistory.reduce((sum, entry) => sum + (entry.value > 0 ? entry.value : 0), 0)}
                        </span>
                    </p>
                    <p>
                        <strong>Points Removed:</strong> <span className="negative">
                            {filteredHistory.reduce((sum, entry) => sum + (entry.value < 0 ? entry.value : 0), 0)}
                        </span>
                    </p>
                </div>
            </div>

            <div className="table-container">
                <table className="data-table history-table">
                    <thead>
                        <tr>
                            <th>Date</th>
                            <th>Student</th>
                            <th>Points</th>
                            <th>Reason</th>
                            <th>Administrator</th>
                        </tr>
                    </thead>
                    <tbody>
                        {currentItems.map(entry => (
                            <tr key={entry.id} className={entry.value >= 0 ? 'row-positive' : 'row-negative'}>
                                <td>{formatDate(entry.createdAt)}</td>
                                <td>
                                    <div>
                                        <div className="student-name">{entry.studentFirstName} {entry.studentLastName}</div>
                                        <div className="student-email">{entry.studentEmail}</div>
                                    </div>
                                </td>
                                <td className={entry.value >= 0 ? 'positive' : 'negative'}>
                                    {entry.value > 0 ? `+${entry.value}` : entry.value}
                                </td>
                                <td className="reason-cell">{entry.reason || '-'}</td>
                                <td>{entry.adminFirstName} {entry.adminLastName}</td>
                            </tr>
                        ))}

                        {currentItems.length === 0 && (
                            <tr>
                                <td colSpan="5" className="empty-message">
                                    No points history found matching your criteria.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {filteredHistory.length > itemsPerPage && (
                <div className="pagination">
                    <button
                        onClick={() => handlePageChange(1)}
                        disabled={currentPage === 1}
                        className="pagination-btn"
                    >
                        &laquo;
                    </button>
                    <button
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="pagination-btn"
                    >
                        &lt;
                    </button>
                    <span className="page-info">
                        Page {currentPage} of {totalPages}
                    </span>
                    <button
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className="pagination-btn"
                    >
                        &gt;
                    </button>
                    <button
                        onClick={() => handlePageChange(totalPages)}
                        disabled={currentPage === totalPages}
                        className="pagination-btn"
                    >
                        &raquo;
                    </button>
                </div>
            )}
        </div>
    );
};

export default AdminHistory;
