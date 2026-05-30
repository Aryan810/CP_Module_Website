import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export function ProtectedRoute({ children }) {
  const { user, isLoading } = useAuth();
  if (isLoading) return <div className="page-content-area"><p>Loading…</p></div>;
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

export function AdminRoute({ children }) {
  const { user, isLoading } = useAuth();
  if (isLoading) return <div className="page-content-area"><p>Loading…</p></div>;
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== 'admin') {
    return (
      <div className="page-content-area">
        <h1>403 — Admins only</h1>
        <p>You don't have permission to view this page.</p>
      </div>
    );
  }
  return children;
}
