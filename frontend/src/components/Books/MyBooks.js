// Library-system_without_modules/Library-system/frontend/src/components/Books/MyBooks.js

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../Tables.css'; //

const MyBooks = () => {
    const [books, setBooks] = useState([]);
    const [error, setError] = useState(""); // Added for error handling

    useEffect(() => {
        const fetchMyBooks = async () => {
            try {
                const token = localStorage.getItem('token');
                const res = await axios.get('/api/my-books', { //
                    headers: { 'x-auth-token': token }
                });
                setBooks(res.data);
            } catch (err) {
                console.error("Failed to fetch my books:", err);
                // Also add auth error handling here
                if (err.response && (err.response.status === 401 || err.response.status === 403)) {
                    setError("Your session has expired. Please log out and log in again.");
                } else {
                    setError("Could not fetch your issued books.");
                }
            }
        };

        fetchMyBooks();
    }, []);

    return (
        <div className='table-container'>
            <h2>My Issued Books</h2>

            {/* Show error if one exists */}
            {error && <div className="alert alert-danger">{error}</div>}

            <table className="table table-hover">
                <thead>
                    <tr>
                        <th>#</th>
                        <th>Title</th>
                        <th>Author</th>
                        <th>Date Issued</th>
                        <th>Date Due</th> {/* <-- ADDED */}
                        <th>Penalty</th> {/* <-- ADDED */}
                    </tr>
                </thead>
                <tbody>
                    {books.length > 0 ? (
                        books.map((book, index) => (
                            // Highlight row if overdue
                            <tr key={book._id} className={book.penalty > 0 ? 'table-danger' : ''}>
                                <td>{index + 1}</td>
                                
                                {/* --- START: THIS IS THE FIX --- */}
                                
                                {/* FIX: Changed to read nested object 'idBook' */}
                                <td>{book.idBook?.name || 'N/A'}</td>
                                <td>{book.idBook?.author || 'N/A'}</td>

                                {/* FIX: Changed 'issueDate' to 'date' */}
                                <td>{new Date(book.date).toLocaleDateString()}</td>

                                {/* FIX: Changed 'dueDate' to 'deadline' */}
                                <td>{new Date(book.deadline).toLocaleDateString()}</td>
                                
                                {/* --- END: THIS IS THE FIX --- */}

                                <td>
                                    {book.penalty > 0 ? (
                                        <span className="badge badge-danger">₹{book.penalty}</span>
                                    ) : (
                                        <span>—</span>
                                    )}
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            {/* Updated colSpan to match new number of columns */}
                            <td colSpan="6" style={{ textAlign: 'center' }}>You have no issued books.</td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
};

export default MyBooks;