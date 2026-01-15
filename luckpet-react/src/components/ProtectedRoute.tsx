// src/components/ProtectedRoute.tsx - COMPLETO E CORRIGIDO:
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requireAdmin = false }) => {
  const { isLoggedIn, isAdmin, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="loading-screen">
        <div className="spinner"></div>
        <p>Verificando acesso...</p>
        <style>{`
          .loading-screen {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
            background: #f8fafc;
          }
          .spinner {
            width: 40px;
            height: 40px;
            border: 3px solid #e5e7eb;
            border-top-color: #8b5cf6;
            border-radius: 50%;
            animation: spin 1s linear infinite;
            margin-bottom: 20px;
          }
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }

  if (requireAdmin && !isAdmin) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;