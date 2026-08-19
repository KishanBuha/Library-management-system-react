// Library-system_without_modules/Library-system/frontend/src/components/Admin/AllBorrows.js

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../Tables.css';
import '../Return/Return.css'; // Added for penalty box styles
import '../Forms.css';       // Added for alert styles

const AllBorrows = () => {
    const [borrows, setBorrows] = useState([]);
    
    // --- State copied from Return.js ---
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [penaltyInfo, setPenaltyInfo] = useState(null);
    const [selectedBorrowId, setSelectedBorrowId] = useState(null); 
    // --- End of copied state ---

    const fetchBorrows = async () => {
        setIsLoading(true);
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get('/api/all-borrows', {
                headers: { 'x-auth-token': token }
            });
            setBorrows(res.data);
        } catch (err) {
            if (err.response && (err.response.status === 401 || err.response.status === 403)) {
                setError("Your session has expired. Please log out and log in again.");
            } else {
                console.error("Failed to fetch borrowed books:", err);
                setError("Failed to fetch borrowed books.");
            }
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchBorrows();
    }, []);

    // --- Handlers copied from Return.js ---

    // Handle "Return" button click (Step 1: Check for penalty)
    const handleReturnClick = async (borrowId) => {
        setMessage('');
        setError('');
        setPenaltyInfo(null);
        setSelectedBorrowId(borrowId); 
        setIsLoading(true);

        try {
            const token = localStorage.getItem('token');
            const res = await axios.post('/api/return', 
                { borrowId },
                { headers: { 'x-auth-token': token } }
            );
            
            setMessage(res.data); // Success (no penalty)
            fetchBorrows(); // Refresh the list
            setSelectedBorrowId(null);

        } catch (err) {
            if (err.response) {
                if (err.response.status === 401 || err.response.status === 403) {
                    setError("Your session has expired. Please log out and log in again.");
                } else if (err.response.status === 402) {
                    // **PENALTY DUE**
                    setError('Penalty is due. Please collect cash before confirming.');
                    setPenaltyInfo(err.response.data);
                } else {
                    setError(err.response.data.message || err.response.data);
                }
            } else {
                setError('Error returning book. Please try again.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    // Handle "Confirm Payment" button click (Step 2: Confirm penalty)
    const handleConfirmPayment = async () => {
        if (!selectedBorrowId) return;

        setMessage('');
        setError('');
        setIsLoading(true);

        try {
            const token = localStorage.getItem('token');
            const res = await axios.post('/api/return', 
                { 
                    borrowId: selectedBorrowId, 
                    paymentConfirmed: true 
                }, 
                { headers: { 'x-auth-token': token } }
            );
            
            setMessage(res.data);
            setPenaltyInfo(null); 
            setSelectedBorrowId(null);
            fetchBorrows(); // Refresh the list

        } catch (err) {
             if (err.response) {
                if (err.response.status === 401 || err.response.status === 403) {
                    setError("Your session has expired. Please log out and log in again.");
                } else {
                    setError(err.response.data.message || err.response.data);
                }
            } else {
                setError('Error confirming payment. Please try again.');
            }
        } finally {
            setIsLoading(false);
        }
    };
    // --- End of copied handlers ---


    return (
        <div className='table-container'>
            <h2>All Issued Books</h2>

            {/* --- Copied JSX from Return.js --- */}
            {message && <div className="alert alert-success">{message}</div>}
            {error && <div className="alert alert-danger">{error}</div>}

            {penaltyInfo && (
                <div className="penalty-box">
                    <h4>Penalty Due</h4>
                    <p>{penaltyInfo.message}</p>
                    <ul className="list-group">
                        <li className="list-group-item">Days Late: <strong>{penaltyInfo.daysLate}</strong></li>
                        <li className="list-group-item">Penalty Rate: <strong>₹10/day</strong></li>
                        <li className="list-group-item">Total Due: <strong>₹{penaltyInfo.penalty}</strong></li>
                    </ul>
                    <button 
                        className="btn btn-success btn-block" 
                        onClick={handleConfirmPayment} 
                        disabled={isLoading}
                        style={{ marginTop: '1rem' }}
                    >
                        {isLoading ? 'Processing...' : 'Confirm Cash Received & Return Book'}
                    </button>
                    <button 
                        className="btn btn-secondary btn-block" 
                        onClick={() => {
                            setPenaltyInfo(null);
                            setSelectedBorrowId(null);
                            setError(null);
                        }}
                        style={{ marginTop: '0.5rem' }}
                    >
                        Cancel
                    </button>
                </div>
            )}
            {/* --- End of copied JSX --- */}


            <table className="table table-hover" style={{ marginTop: '20px' }}>
                <thead>
                    <tr>
                        <th>#</th>
                        <th>Book Name</th>
                        <th>Student Name</th>
                        <th>Student Roll No.</th>
                        <th>Date Issued</th>
                        <th>Date Due</th>
                        <th>Penalty</th>
                        <th>Action</th> {/* <-- CHANGED */}
                    </tr>
                </thead>
                <tbody>
                    {borrows.length > 0 ? (
                        borrows.map((borrow, index) => (
                            <tr key={borrow._id} className={borrow.penalty > 0 ? 'table-danger' : ''}>
                                <td>{index + 1}</td>
                                <td>{borrow.idBook?.name || 'N/A'}</td>
                                <td>{borrow.idStudent?.name || 'N/A'}</td>
                                <td>{borrow.idStudent?.rollNumber || 'N/A'}</td>
                                <td>{new Date(borrow.date).toLocaleDateString()}</td>
                                <td>{new Date(borrow.deadline).toLocaleDateString()}</td>
                                <td>
                                    {borrow.penalty > 0 ? (
                                        <span className="badge badge-danger">₹{borrow.penalty}</span>
                                    ) : (
                                        <span className="badge badge-success">—</span>
                                    )}
                                </td>
                                
                                {/* --- CHANGED "Borrow ID" to this button --- */}
                                <td>
                                    <button 
                                        className="btn btn-primary btn-sm"
                                        disabled={isLoading && selectedBorrowId === borrow._id}
                                        onClick={() => handleReturnClick(borrow._id)}
                                    >
                                        {/* Show loading state on the specific button clicked */}
                                        {isLoading && selectedBorrowId === borrow._id ? '...' : 'Return'}
                                    </button>
                                </td>
                                {/* --- End of change --- */}

                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="8" style={{ textAlign: 'center' }}>No books currently issued.</td>
                        </tr>
                    )}
                </tbody>
            </table>
            
        </div>
    );
};

export default AllBorrows;