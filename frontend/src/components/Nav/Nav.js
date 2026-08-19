import React from 'react';
import './Nav.css';
import { NavLink } from 'react-router-dom'; // <-- Import NavLink instead of Link
import { jwtDecode } from 'jwt-decode';

class Nav extends React.Component {

    state = {
        user: null
    };

    componentDidMount() {
        try {
            const jwt = localStorage.getItem('token');
            const user = jwtDecode(jwt);
            this.setState({ user });
        } catch (ex) {}
    }

    handleLogout = () => {
        localStorage.removeItem('token');
        window.location = '/login';
    };
    
    render(){
        const { user } = this.state;
        return (
            <div id='nav'>
                <span>Sabargam Library System</span>
                <ul>
                    {/* Conditional "Home" link */}
                    {user && user.role === 'admin' ? (
                        <li><NavLink to='/admin' exact activeClassName="active">Home</NavLink></li>
                    ) : (
                        <li><NavLink to='/home' exact activeClassName="active">Home</NavLink></li>
                    )}
                    
                    {/* Conditional "Manage Books" vs "All Books" link */}
                    {user && user.role === 'admin' ? (
                        <li><NavLink to='/books' activeClassName="active">Manage Books</NavLink></li>
                    ) : (
                        <li><NavLink to='/books' activeClassName="active">All Books</NavLink></li>
                    )}

                    {/* == Admin-Only Links == */}
                    {user && user.role === 'admin' && (
                        <React.Fragment>
                            <li><NavLink to='/issue' activeClassName="active">Issue Book</NavLink></li>
                            <li><NavLink to='/admin/return-book' activeClassName="active">Return Book</NavLink></li>
                            <li><NavLink to='/admin/reports' activeClassName="active">Reports</NavLink></li>
                        </React.Fragment>
                    )}
                    
                    {/* == Student-Only Links == */}
                    {user && user.role === 'student' && (
                        <React.Fragment>
                            <li><NavLink to='/my-books' activeClassName="active">My Books</NavLink></li>
                            <li><NavLink to='/my-history' activeClassName="active">My History</NavLink></li>
                        </React.Fragment>
                    )}
                    
                    {/* General links for everyone */}
                    <li><NavLink to='/contact' activeClassName="active">Contact</NavLink></li>

                    {/* Authentication links */}
                    {!user && <li><NavLink to='/login' activeClassName="active">Login</NavLink></li>}
                    {user && <li><span style={{ cursor: 'pointer' }} onClick={this.handleLogout}>Logout</span></li>}
                </ul>
            </div>
        );
    }
}

export default Nav;