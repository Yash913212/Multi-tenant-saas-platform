import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

type ProtectedRouteProps = {
  children: React.ReactElement;
};

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { token, loading } = useAuth();
  if (loading) return <div className="container">Loading...</div>;
  if (!token) return <Navigate to="/login" replace />;
  return children;
};

export default ProtectedRoute;