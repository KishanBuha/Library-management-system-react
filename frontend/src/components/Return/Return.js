import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../Tables.css'; // For the table
import './Return.css';   // For the penalty box
import '../Forms.css';   // For general form/alert styles

const Return = () => {
    // State for the list of borrowed books
    const [borrows, setBorrows] = useState([]);
    
    // State for managing the return process
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    
    // State for the penalty modal
    const [penaltyInfo, setPenaltyInfo] = useState(null);
    // State to track which borrowId is being processed
    const [selectedBorrowId, setSelectedBorrowId] = useState(null); 

    // 1. Fetch all borrowed books when the component loads
    const fetchBorrows = async () => {
        setIsLoading(true);
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get('/api/all-borrows', {
                headers: { 'x-auth-token': token }
            });
            setBorrows(res.data);
        } catch (err) {
            // --- FIX FOR REDIRECT ---
            // If the *initial load* fails, check for auth error
            if (err.response && (err.response.status === 401 || err.response.status === 403)) {
                setError("Your session has expired. Please log out and log in again.");
            } else {
                setError("Failed to fetch borrowed books.");
            }
            // --- END FIX ---
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchBorrows();
    }, []);

    // 2. Handle the "Return" button click (Step 1: Check for penalty)
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
            
            setMessage(res.data);
            fetchBorrows(); // Refresh the list
            setSelectedBorrowId(null);

        } catch (err) {
            if (err.response) {
                // --- FIX FOR REDIRECT ---
                if (err.response.status === 401 || err.response.status === 403) {
                    setError("Your session has expired. Please log out and log in again.");
                    // This stops the redirect!
                // --- END FIX ---
                } else if (err.response.status === 402) {
                    // This is the PENALTY logic
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

    // 3. Handle the "Confirm Payment" button click (Step 2: Confirm penalty)
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
                // --- FIX FOR REDIRECT (also needed here) ---
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

    return (
        <div className="table-container return-container">
            <h2>Return a Book</h2>

            {message && <div className="alert alert-success">{message}</div>}
            {error && <div className="alert alert-danger">{error}</div>}

            {/* Penalty Information Box (Modal) */}
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

            {/* Table of Issued Books */}
            <h3 style={{ marginTop: '20px' }}>Currently Issued Books</h3>
            <table className="table table-hover">
                <thead>
                    <tr>
                        <th>Student Name</th>
                        <th>Roll Number</th>
                        <th>Book Name</th>
                        <th>Date Issued</th>
                        <th>Date Due</th>
                        <th>Penalty</th>
                        <th>Action</th> 
                    </tr>
                </thead>
                <tbody>
                    {borrows.length > 0 ? (
                        borrows.map(borrow => (
                            <tr key={borrow._id} className={borrow.penalty > 0 ? 'table-danger' : ''}>
                                
                                {/* --- FIX FOR BLANK DATA --- */}
                                <td>{borrow.idStudent?.name || 'N/A'}</td>
                                <td>{borrow.idStudent?.rollNumber || 'N/A'}</td>
                                <td>{borrow.idBook?.name || 'N/A'}</td>
                                <td>{borrow.date ? new Date(borrow.date).toLocaleDateString() : 'N/A'}</td>
                                <td>{borrow.deadline ? new Date(borrow.deadline).toLocaleDateString() : 'N/A'}</td>
                                {/* --- END FIX --- */}

                                <td>
                                    {borrow.penalty > 0 ? (
                                        <span className="badge badge-danger">₹{borrow.penalty}</span>
                                    ) : (
                                        <span className="badge badge-success">—</span>
                                    )}
                                </td>
                                <td>
                                    <button 
                                        className="btn btn-primary btn-sm"
                                        disabled={isLoading && selectedBorrowId === borrow._id}
                                        onClick={() => handleReturnClick(borrow._id)}
                                    >
                                        {isLoading && selectedBorrowId === borrow._id ? '...' : 'Return'}
                                    </button>
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="7" style={{ textAlign: 'center' }}>No books currently issued.</td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
};

export default Return;