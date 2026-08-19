import React from 'react';
import '../Tables.css';
import { jwtDecode } from 'jwt-decode';
import './Pagination.css'; // Import a new CSS file for pagination styles

class AllBooks extends React.Component {
    state = {
        books: [],
        user: null,
        currentPage: 1,      // State to track the current page
        booksPerPage: 10     // Set to 10 books per page as requested
    };

    async componentDidMount() {
        // Check for user role
        try {
            const jwt = localStorage.getItem('token');
            const user = jwtDecode(jwt);
            this.setState({ user });
        } catch (ex) {
            // No user/invalid token, user will be null
        }

        // Fetch books
        try {
            const res = await fetch("/api/getBooks");
            const books = await res.json();
            this.setState({ books });
        } catch (error) {
            console.error("Failed to fetch books:", error);
        }
    }

    // Handler to change the page
    handlePageChange = (pageNumber) => {
        this.setState({ currentPage: pageNumber });
    };

    render() {
        const { user, books, currentPage, booksPerPage } = this.state;
        const isAdmin = user && user.role === 'admin';

        // --- Pagination Logic ---
        
        // Calculate the total number of pages
        const totalPages = Math.ceil(books.length / booksPerPage);

        // Get the books for the current page
        const indexOfLastBook = currentPage * booksPerPage;
        const indexOfFirstBook = indexOfLastBook - booksPerPage;
        const currentBooks = books.slice(indexOfFirstBook, indexOfLastBook);

        // Generate page numbers
        const pageNumbers = [];
        for (let i = 1; i <= totalPages; i++) {
            pageNumbers.push(i);
        }

        // --- End Pagination Logic ---

        return (
            <div className='table-container'>
                <h2>{isAdmin ? 'Manage Books' : 'Available Books'}</h2>
                <table className="table table-hover">
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>Title</th>
                            <th>Author</th>
                            <th>Semester</th>
                            <th>Available Copies</th>
                        </tr>
                    </thead>
                    <tbody>
                        {/* Map over currentBooks instead of the full books array */}
                        {currentBooks.map((book, index) => (
                            <tr key={book._id}>
                                {/* Adjust index to be correct for the full list */}
                                <td>{indexOfFirstBook + index + 1}</td>
                                <td>{book.name}</td>
                                <td>{book.author}</td>
                                <td>{book.semester}</td>
                                <td><span className="badge badge-success">{book.count}</span></td>
                            </tr>
                        ))}
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
                                    onClick={() => this.handlePageChange(currentPage - 1)}
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
                                        onClick={() => this.handlePageChange(number)}
                                    >
                                        {number}
                                    </button>
                                </li>
                            ))}

                            {/* Next Button */}
                            <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                                <button 
                                    className="page-link" 
                                    onClick={() => this.handlePageChange(currentPage + 1)}
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
    }
}

export default AllBooks;