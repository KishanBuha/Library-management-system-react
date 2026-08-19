import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../Tables.css';
import '../Admin/Reports.css'; // Reusing the same CSS for styling

const MyHistory = () => {
    const [history, setHistory] = useState([]);

    const fetchHistory = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get('/api/my-history', {
                headers: { 'x-auth-token': token }
            });
            setHistory(res.data);
        } catch (error) {
            console.error("Failed to fetch student history:", error);
        }
    };

    useEffect(() => {
        fetchHistory();
    }, []);

    const handleClearHistory = async () => {
        if (window.confirm("Are you sure you want to permanently delete your transaction history?")) {
            try {
                const token = localStorage.getItem('token');
                await axios.delete('/api/my-history', {
                    headers: { 'x-auth-token': token }
                });
                setHistory([]); // Clear the history from the view
            } catch (error) {
                console.error("Failed to clear history:", error);
                alert("Could not clear your history. Please try again.");
            }
        }
    };

    return (
        <div className="reports-container">
            <div className="reports-header">
                <h2>My Transaction History</h2>
                <button onClick={handleClearHistory} className="btn btn-danger">Clear History</button>
            </div>
            <table className="table table-hover">
                <thead>
                    <tr>
                        <th>Book Name</th>
                        <th>Status</th>
                        <th>Issue Date</th>
                        <th>Return Date</th>
                    </tr>
                </thead>
                <tbody>
                    {history.length > 0 ? (
                        history.map(item => (
                            item.idBook && (
                                <tr key={item._id}>
                                    <td>{item.idBook.name}</td>
                                    <td className={item.status === 'issued' ? 'action-issued' : 'action-returned'}>
                                        {item.status.toUpperCase()}
                                    </td>
                                    <td>{new Date(item.issueDate).toLocaleString()}</td>
                                    <td>{item.returnDate ? new Date(item.returnDate).toLocaleString() : 'Not Returned'}</td>
                                </tr>
                            )
                        ))
                    ) : (
                        <tr>
                            <td colSpan="4" style={{ textAlign: 'center' }}>You have no transaction history.</td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
};

export default MyHistory;