import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../Tables.css';
import './Reports.css';
import '../Books/Pagination.css'; // <-- Import the pagination styles you created

const Reports = () => {
    const [history, setHistory] = useState([]);
    
    // --- Pagination State ---
    const [currentPage, setCurrentPage] = useState(1);
    const [entriesPerPage] = useState(5); // <-- Set to 5 as requested
    // --- End Pagination State ---

    const fetchHistory = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get('/api/history', {
                headers: { 'x-auth-token': token }
            });
            setHistory(res.data);
        } catch (error) {
            console.error("Failed to fetch history:", error);
        }
    };

    useEffect(() => {
        fetchHistory();
    }, []);

    const handleClearHistory = async () => {
        if (window.confirm("Are you sure you want to permanently delete all transaction history? This action cannot be undone.")) {
            try {
                const token = localStorage.getItem('token');
                await axios.delete('/api/history', {
                    headers: { 'x-auth-token': token }
                });
                setHistory([]); // Clear the history in the state
                setCurrentPage(1); // Reset to first page
            } catch (error) {
                console.error("Failed to clear history:", error);
                alert("Could not clear history. Please try again.");
            }
        }
    };

    // --- Pagination Logic ---
    const indexOfLastEntry = currentPage * entriesPerPage;
    const indexOfFirstEntry = indexOfLastEntry - entriesPerPage;
    const currentEntries = history.slice(indexOfFirstEntry, indexOfLastEntry);
    
    const totalPages = Math.ceil(history.length / entriesPerPage);

    const pageNumbers = [];
    for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
    }

    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
    };
    // --- End Pagination Logic ---

    return (
        <div className="reports-container">
            <div className="reports-header">
                <h2>Transaction History</h2>
                <button onClick={handleClearHistory} className="btn btn-danger">Clear History</button>
            </div>
            <table className="table table-hover">
                <thead>
                    <tr>
                        <th>Book Name</th>
                        <th>Student Name</th>
                        <th>Student Roll No.</th>
                        <th>Status</th>
                        <th>Issue Date</th>
                        <th>Return Date</th>
                    </tr>
                </thead>
                <tbody>
                    {currentEntries.length > 0 ? ( // <-- Change history.length to currentEntries.length
                        currentEntries.map(item => ( // <-- Change history.map to currentEntries.map
                            item.idBook && item.idStudent ? (
                                <tr key={item._id}>
                                    <td>{item.idBook.name}</td>
                                    <td>{item.idStudent.name}</td>
                                    <td>{item.idStudent.rollNumber}</td>
                                    <td className={item.status === 'issued' ? 'action-issued' : 'action-returned'}>
                                        {item.status.toUpperCase()}
                                    </td>
                                    <td>{new Date(item.issueDate).toLocaleString()}</td>
                                    <td>{item.returnDate ? new Date(item.returnDate).toLocaleString() : 'Not Returned'}</td>
                                </tr>
                            ) : null
                        ))
                    ) : (
                        <tr>
                            <td colSpan="6" style={{ textAlign: 'center' }}>No transaction history found.</td>
                        </tr>
                    )}
                </tbody>
            </table>

            {/* --- Pagination Controls --- */}
            {totalPages > 1 && (
                <nav>
                    <ul className="pagination">
                        {/* Previous Button */}
                        <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                            <button 
                                className="page-link" 
                                onClick={() => handlePageChange(currentPage - 1)}
                                disabled={currentPage === 1}
                            >
                                Previous
                            </button>
                        </li>

                        {/* Page Number Buttons */}
                        {pageNumbers.map(number => (
                            <li key={number} className={`page-item ${number === currentPage ? 'active' : ''}`}>
                                <button 
                                    className="page-link" 
                                    onClick={() => handlePageChange(number)}
                                >
                                    {number}
                                </button>
                            </li>
                        ))}

                        {/* Next Button */}
                        <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                            <button 
                                className="page-link" 
                                onClick={() => handlePageChange(currentPage + 1)}
                                disabled={currentPage === totalPages}
                            >
                                Next
                            </button>
                        </li>
                    </ul>
                </nav>
            )}
            {/* --- End Pagination Controls --- */}

        </div>
    );
};

export default Reports;