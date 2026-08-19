import React, { useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import '../Forms.css';

const Register = (props) => {
    const [name, setName] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('student');
    const [rollNumber, setRollNumber] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleRegister = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        try {
            const payload = { name, password, role };
            if (role === 'student') {
                if (!rollNumber) {
                    setError('Roll Number is required for students.');
                    return;
                }
                payload.rollNumber = rollNumber;
            }

            await axios.post('/api/auth/register', payload);
            setSuccess('Registration successful! You can now log in.');
            // Clear form
            setName('');
            setPassword('');
            setRollNumber('');
        } catch (ex) {
            if (ex.response && ex.response.status === 400) {
                setError(ex.response.data);
            } else {
                setError('An unexpected error occurred.');
            }
        }
    };

    return (
        <div className="form-container">
            <h2>Register an Account</h2>
            <form onSubmit={handleRegister}>
                <div className="form-group">
                    <label>Role</label>
                    <select className="form-control" value={role} onChange={(e) => setRole(e.target.value)}>
                        <option value="student">Student</option>
                        <option value="admin">Admin</option>
                    </select>
                </div>

                {role === 'student' && (
                    <div className="form-group">
                        <label>Student ID / Roll Number</label>
                        <input
                            type="number"
                            className="form-control"
                            placeholder="e.g. 101"
                            value={rollNumber}
                            onChange={(e) => setRollNumber(e.target.value)}
                            required
                        />
                    </div>
                )}

                <div className="form-group">
                    <label>{role === 'student' ? "Full Name" : "Admin Username"}</label>
                    <input
                        type="text"
                        className="form-control"
                        placeholder={role === 'student' ? "Student's Name" : "Admin's Username"}
                        value={name}
                        onChange={(e) => setName(e.target.value)}
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
                {success && <div className="alert alert-success">{success}</div>}

                <button type="submit" className="btn btn-primary btn-block">Register</button>
            </form>
            <p className="mt-3 text-center">
                Already have an account? <Link to="/login">Login here</Link>
            </p>
        </div>
    );
};

export default Register;