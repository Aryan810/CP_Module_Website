import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.jsx';
import Navbar from './components/Navbar.jsx';
import Home from './pages/Home.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import Contests from './pages/Contests.jsx';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="app-main-container">
          <Navbar />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/problems" element={<div className="page-content-area"><h1>Problems Page</h1><p>Coming soon...</p></div>} />
            <Route path="/contests" element={<Contests />} />
            <Route path="/leaderboard" element={<div className="page-content-area"><h1>Leaderboard Page</h1><p>Coming soon...</p></div>} />
            <Route path="/profile" element={<div className="page-content-area"><h1>Profile Page</h1><p>Coming soon...</p></div>} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
