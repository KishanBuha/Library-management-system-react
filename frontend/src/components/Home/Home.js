import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import './Home.css';

const Home = () => {
    const [userName, setUserName] = useState('user');

    useEffect(() => {
        try {
            const jwt = localStorage.getItem('token');
            if (jwt) {
                const user = jwtDecode(jwt);
                // Set the user's name, fallback to 'user' if not present
                setUserName(user.name || 'user');
            }
        } catch (ex) {
            // If token is invalid or doesn't exist, the name remains 'user'
            console.error("Could not decode token:", ex);
        }
    }, []);

    return (
        <div className="home-container">
            <div className="welcome-header">
                <h2>Welcome, {userName}!</h2>
                <p>Here’s a quick overview of your library activity.</p>
            </div>
            <div className="dashboard-cards">
                <div className="card">
                    <h4>Currently Issued Books</h4>
                    <p>View the books you have borrowed.</p>
                    <Link to="/my-books" className="btn btn-outline-primary">View My Books</Link>
                </div>
                <div className="card">
                    <h4>Explore the Collection</h4>
                    <p>Find your next read from our extensive catalog.</p>
                    <Link to="/books" className="btn btn-primary">Browse All Books</Link>
                </div>
                <div className="card">
                    <h4>Your Profile</h4>
                    <p>Manage your account and contact preferences.</p>
                    <Link to="/contact" className="btn btn-outline-primary">Contact Us</Link>
                </div>
            </div>
        </div>
    );
};

export default Home;