import React, { useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import '../Forms.css';

const Login = (props) => {
    const [userType, setUserType] = useState('student');
    const [identifier, setIdentifier] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        try {
            const payload = userType === 'student'
                ? { rollNumber: identifier, password }
                : { name: identifier, password };
            
            const response = await axios.post('/api/auth/login', payload);
            const token = response.data;
            
            localStorage.setItem('token', token);
            const user = jwtDecode(token);

            if (user.role === 'admin') {
                window.location = '/admin';
            } else {
                window.location = '/home'; // Redirect student to /home
            }

        } catch (ex) {
            if (ex.response && ex.response.status === 400) {
                setError('Invalid credentials.');
            } else {
                setError('An error occurred. Please try again.');
            }
        }
    };

    const handleUserTypeChange = (type) => {
        setUserType(type);
        setIdentifier('');
        setPassword('');
        setError('');
    };

    return (
        <div className="form-container">
            <h2>Login</h2>
            <div className="user-type-selector">
                <label className={userType === 'student' ? 'active' : ''}>
                    <input type="radio" value="student" checked={userType === 'student'} onChange={() => handleUserTypeChange('student')} />
                    Student
                </label>
                <label className={userType === 'admin' ? 'active' : ''}>
                    <input type="radio" value="admin" checked={userType === 'admin'} onChange={() => handleUserTypeChange('admin')} />
                    Admin
                </label>
            </div>
            <form onSubmit={handleLogin}>
                <div className="form-group">
                    <label>{userType === 'student' ? 'Student ID' : 'Admin Username'}</label>
                    <input
                        type={userType === 'student' ? 'number' : 'text'}
                        className="form-control"
                        placeholder={userType === 'student' ? 'e.g., 101' : 'e.g., admin'}
                        value={identifier}
                        onChange={(e) => setIdentifier(e.target.value)}
                        required
                    />
                </div>
                <div className="form-group">
                    <label>Password</label>
                    <input
                        type="password"
                        className="form-control"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </div>
                {error && <div className="alert alert-danger">{error}</div>}
                <button type="submit" className="btn btn-primary btn-block">Login</button>
            </form>
            <p className="mt-3 text-center">
                Don't have an account? <Link to="/register">Register here</Link>
            </p>
        </div>
    );
};

export default Login;