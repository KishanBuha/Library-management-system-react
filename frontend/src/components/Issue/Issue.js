import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Issue.css';

const Issue = () => {
    const [allBooks, setAllBooks] = useState([]);
    const [allStudents, setAllStudents] = useState([]);
    const [selectedBook, setSelectedBook] = useState('');
    const [selectedStudent, setSelectedStudent] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    // Function to fetch all necessary data
    const fetchData = async () => {
        try {
            const token = localStorage.getItem('token');
            const headers = { 'x-auth-token': token };

            const [booksRes, studentsRes] = await Promise.all([
                axios.get('/api/getBooks', { headers }),
                axios.get('/api/all-students', { headers })
            ]);

            const availableBooks = booksRes.data.filter(book => book.count > 0);
            setAllBooks(availableBooks);
            setAllStudents(studentsRes.data);

            // Set default selected values
            if (availableBooks.length > 0 && !selectedBook) {
                setSelectedBook(availableBooks[0]._id);
            }
            if (studentsRes.data.length > 0 && !selectedStudent) {
                setSelectedStudent(studentsRes.data[0].rollNumber);
            }
        } catch (err) {
            setError('Failed to load data. Please try again.');
            console.error(err);
        }
    };

    useEffect(() => {
        fetchData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleIssueBook = async (e) => {
        e.preventDefault();
        setMessage('');
        setError('');

        if (!selectedBook || !selectedStudent) {
            setError('Please select both a book and a student.');
            return;
        }

        try {
            const token = localStorage.getItem('token');
            await axios.post('/api/borrow', {
                bookId: selectedBook,
                studentId: selectedStudent
            }, {
                headers: { 'x-auth-token': token }
            });
            
            const student = allStudents.find(s => s.rollNumber === parseInt(selectedStudent, 10));
            const book = allBooks.find(b => b._id === selectedBook);
            setMessage(`${book.name} issued to ${student.name} successfully!`);
            
            // Refresh book list to update the available count
            fetchData();
        } catch (err) {
            const errorMessage = err.response?.data || 'An error occurred while issuing the book.';
            setError(errorMessage);
            console.error(err);
        }
    };
    
    return (
        <div className="issue-container">
            <h2>Issue Book</h2>
            <form className="issue-form" onSubmit={handleIssueBook}>
                <div className="form-group">
                    <label htmlFor="book-select">Select Book</label>
                    <select id="book-select" className="form-control" value={selectedBook} onChange={e => setSelectedBook(e.target.value)}>
                        {allBooks.length > 0 ? allBooks.map(book => (
                            <option key={book._id} value={book._id}>
                                {book.name} (Available: {book.count})
                            </option>
                        )) : <option>No books available</option>}
                    </select>
                </div>

                <div className="form-group">
                    <label htmlFor="student-select">Select Student</label>
                    <select id="student-select" className="form-control" value={selectedStudent} onChange={e => setSelectedStudent(e.target.value)}>
                        {allStudents.length > 0 ? allStudents.map(student => (
                            <option key={student._id} value={student.rollNumber}>
                                {student.name} - {student.rollNumber}
                            </option>
                        )) : <option>No students found</option>}
                    </select>
                </div>
                
                <button type="submit" className="btn">Issue Book</button>
            </form>

            {message && <div className="message success">{message}</div>}
            {error && <div className="message error">{error}</div>}
        </div>
    );
};

export default Issue;