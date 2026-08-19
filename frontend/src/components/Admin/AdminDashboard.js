import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './AdminDashboard.css'; // Import the new CSS file

const AdminDashboard = () => {
    const [stats, setStats] = useState({
        totalBooks: 0,
        totalStudents: 0,
        booksIssued: 0,
        booksReturned: 0 // <-- Changed from 6 to 0
    });

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) return;
                const headers = { 'x-auth-token': token };

                // Fetch total books (sum of counts)
                const booksRes = await axios.get('/api/getBooks', { headers });
                const totalBookCount = booksRes.data.reduce((sum, book) => sum + book.count, 0);

                // Fetch total students
                const studentsRes = await axios.get('/api/students', { headers });
                const totalStudentCount = studentsRes.data.count;

                // Fetch issued books count
                const borrowsRes = await axios.get('/api/all-borrows', { headers });
                const issuedCount = borrowsRes.data.length;

                setStats(prevStats => ({
                    ...prevStats,
                    totalBooks: totalBookCount,
                    totalStudents: totalStudentCount,
                    booksIssued: issuedCount
                }));

            } catch (error) {
                console.error("Failed to fetch dashboard stats:", error);
            }
        };

        fetchStats();
    }, []);

    return (
        <div className="admin-dashboard-container">
            <h2 className="dashboard-title">Admin Dashboard</h2>

            <div className="stat-cards">
                <div className="stat-card total-books">
                    <span className="stat-number">{stats.totalBooks}</span>
                    <span className="stat-label">Total Books</span>
                </div>
                <div className="stat-card total-students">
                    <span className="stat-number">{stats.totalStudents}</span>
                    <span className="stat-label">Total Students</span>
                </div>
                <div className="stat-card books-issued">
                    <span className="stat-number">{stats.booksIssued}</span>
                    <span className="stat-label">Books Issued</span>
                </div>
                <div className="stat-card books-returned">
                    <span className="stat-number">{stats.booksReturned}</span>
                    <span className="stat-label">Books Returned</span>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;