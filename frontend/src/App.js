import React, { Component } from 'react';
import { Route, Redirect, Switch } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

import Nav from './components/Nav/Nav';
import Home from './components/Home/Home';
import AllBooks from './components/Books/AllBooks';
import MyBooks from './components/Books/MyBooks';
import MyHistory from './components/Books/MyHistory';
import Issue from './components/Issue/Issue';
import Reports from './components/Admin/Reports'; 
import Login from './components/Login/Login';
import Register from './components/Register/Register';
import AdminDashboard from './components/Admin/AdminDashboard';
import AllBorrows from './components/Admin/AllBorrows';
import Contact from './components/Contact/Contact';
import Footer from './components/Footer/Footer';

import './App.css';

class App extends Component {
  state = {};

  constructor() {
    super();
    try {
        const jwt = localStorage.getItem('token');
        const user = jwtDecode(jwt);
        this.state.user = user;
    } catch (ex) {}
  }

  render(){
    const { user } = this.state;
    return (
      <div className="App">
        <Nav />
        <main className="main-container">
          <Switch>
            <Route path='/login' render={props => {
              if (user && user.role === 'admin') return <Redirect to="/admin" />;
              if (user) return <Redirect to="/home" />;
              return <Login {...props} />;
            }}/>
            <Route path='/register' component={Register}/>
            <Route path='/contact' component={Contact}/>
            <Route path='/books' component={AllBooks}/>
            
            {/* Admin Routes */}
            <Route path='/admin/return-book' render={props => {
              if (!user || user.role !== 'admin') return <Redirect to="/login"/>;
              return <AllBorrows {...props} />;
            }}/>
            <Route path='/admin/reports' render={props => { 
              if (!user || user.role !== 'admin') return <Redirect to="/login"/>;
              return <Reports {...props} />;
            }}/>
            <Route path='/admin' render={props => {
              if (!user || user.role !== 'admin') return <Redirect to="/login"/>;
              return <AdminDashboard {...props} />;
            }}/>
            <Route path='/issue' render={props => {
              if (!user || user.role !== 'admin') return <Redirect to="/login"/>;
              return <Issue {...props} />;
            }}/>
            
            {/* Student and General Routes */}
            <Route path='/home' render={props => {
              if (!user) return <Redirect to="/login"/>;
              return <Home {...props} />;
            }}/>
            <Route path='/my-books' render={props => {
              if (!user || user.role !== 'student') return <Redirect to="/login"/>;
              return <MyBooks {...props} />;
            }}/>
            <Route path='/my-history' render={props => {
              if (!user || user.role !== 'student') return <Redirect to="/login"/>;
              return <MyHistory {...props} />;
            }}/>
           
            <Redirect from='/' exact to='/home'/>
            <Redirect from='*' to='/home'/>
          </Switch>
        </main>
        <Footer />
      </div>
    );
  }
}

export default App;