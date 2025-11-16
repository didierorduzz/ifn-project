import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, requiredRole }) => {
  const { usuario, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && usuario?.rol !== requiredRole) {
    // Si el rol no coincide, redirigir al dashboard correspondiente
    return <Navigate to={usuario?.rol === 'admin' ? '/admin' : '/brigadista'} replace />;
  }

  return children;
};

export default ProtectedRoute;