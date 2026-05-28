import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.jsx';
import { ProtectedRoute, AdminRoute } from './components/RouteGuards.jsx';
import Navbar from './components/Navbar.jsx';
import Home from './pages/Home.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import Contests from './pages/Contests.jsx';
import Leaderboard from './pages/Leaderboard.jsx';
import Events from './pages/Events.jsx';
import EventDetail from './pages/EventDetail.jsx';
import Profile from './pages/Profile.jsx';
import AdminHome from './pages/admin/AdminHome.jsx';
import AdminEvents from './pages/admin/AdminEvents.jsx';
import AdminEventEdit from './pages/admin/AdminEventEdit.jsx';
import AdminLeaderboards from './pages/admin/AdminLeaderboards.jsx';
import AdminLeaderboardEdit from './pages/admin/AdminLeaderboardEdit.jsx';
import Api from './services/api';
import './App.css';

function App() {
  const [site, setSite] = useState({ name: 'CP-Hub' });
  useEffect(() => { Api.loadSite().then((s) => s && setSite(s)); }, []);
  useEffect(() => { if (site?.name) document.title = site.name; }, [site]);

  return (
    <AuthProvider>
      <Router>
        <div className="app-main-container">
          <Navbar site={site} />
          <Routes>
            <Route path="/" element={<Home site={site} />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/contests" element={<Contests />} />
            <Route path="/leaderboard" element={<Leaderboard />} />
            <Route path="/events" element={<Events />} />
            <Route path="/events/:slug" element={<EventDetail />} />
            <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
            <Route path="/admin" element={<AdminRoute><AdminHome /></AdminRoute>} />
            <Route path="/admin/events" element={<AdminRoute><AdminEvents /></AdminRoute>} />
            <Route path="/admin/events/:slug" element={<AdminRoute><AdminEventEdit /></AdminRoute>} />
            <Route path="/admin/leaderboards" element={<AdminRoute><AdminLeaderboards /></AdminRoute>} />
            <Route path="/admin/leaderboards/:id" element={<AdminRoute><AdminLeaderboardEdit /></AdminRoute>} />
            <Route path="*" element={<div className="page-content-area"><h1>404</h1><p>Page not found.</p></div>} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
