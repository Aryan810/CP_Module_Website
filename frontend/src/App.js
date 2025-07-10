import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import './App.css';

function App() {
  return (
    <Router>
      <div className="app-main-container">
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/problems" element={<div className="page-content-area"><h1>Problems Page</h1><p>Coming soon...</p></div>} />
          <Route path="/contests" element={<div className="page-content-area"><h1>Contests Page</h1><p>Coming soon...</p></div>} />
          <Route path="/leaderboard" element={<div className="page-content-area"><h1>Leaderboard Page</h1><p>Coming soon...</p></div>} />
          <Route path="/profile" element={<div className="page-content-area"><h1>Profile Page</h1><p>Coming soon...</p></div>} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
