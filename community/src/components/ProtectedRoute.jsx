import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children }) {
  const { user, userDoc, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (userDoc?.banned) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface px-4">
        <div className="text-center max-w-sm">
          <p className="text-4xl mb-4">🚫</p>
          <h2 className="text-xl font-serif text-teal-dark mb-2">Account Suspended</h2>
          <p className="text-sm text-gray-500">
            Your access to the Sovereign Community has been suspended. If you believe this is an error, please contact support.
          </p>
        </div>
      </div>
    );
  }

  return children;
}
