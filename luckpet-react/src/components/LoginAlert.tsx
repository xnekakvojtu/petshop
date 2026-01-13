// src/components/LoginAlert.tsx - ATUALIZADO COM openLoginAlert
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

interface LoginAlertProps {
  message?: string;
}

const LoginAlert: React.FC<LoginAlertProps> = ({ message = 'Faça login para continuar' }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [alertMessage, setAlertMessage] = useState(message);
  const navigate = useNavigate();

  useEffect(() => {
    // Handler para evento showLoginAlert (já existente)
    const handleShowLoginAlert = (event: CustomEvent) => {
      setAlertMessage(event.detail?.message || message);
      setIsVisible(true);
    };

    // Handler NOVO para evento openLoginAlert (do ProductCard)
    const handleOpenLoginAlert = () => {
      setAlertMessage(message); // Usa a mensagem padrão
      setIsVisible(true);
    };

    // Adiciona ambos os listeners
    window.addEventListener('showLoginAlert', handleShowLoginAlert as EventListener);
    window.addEventListener('openLoginAlert', handleOpenLoginAlert as EventListener);

    return () => {
      window.removeEventListener('showLoginAlert', handleShowLoginAlert as EventListener);
      window.removeEventListener('openLoginAlert', handleOpenLoginAlert as EventListener);
    };
  }, [message]);

  const handleLogin = () => {
    setIsVisible(false);
    navigate('/login');
  };

  const handleClose = () => {
    setIsVisible(false);
  };

  // Fechar com ESC
  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isVisible) {
        handleClose();
      }
    };

    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isVisible]);

  // Prevenir scroll do body quando modal aberto
  useEffect(() => {
    if (isVisible) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }

    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isVisible]);

  if (!isVisible) return null;

  return (
    <div className="login-alert-overlay">
      <div className="login-alert-modal" onClick={(e) => e.stopPropagation()}>
        <div className="login-alert-header">
          <i className="fas fa-exclamation-circle"></i>
          <h3>Atenção</h3>
          <button 
            className="close-btn" 
            onClick={handleClose}
            aria-label="Fechar"
          >
            <i className="fas fa-times"></i>
          </button>
        </div>
        
        <div className="login-alert-body">
          <p>{alertMessage}</p>
        </div>
        
        <div className="login-alert-footer">
          <button 
            className="login-alert-btn secondary" 
            onClick={handleClose}
          >
            Cancelar
          </button>
          <button 
            className="login-alert-btn primary" 
            onClick={handleLogin}
            autoFocus
          >
            <i className="fas fa-sign-in-alt"></i>
            Fazer Login
          </button>
        </div>
      </div>
      
      <style>{`
        .login-alert-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 9999;
          backdrop-filter: blur(4px);
          animation: fadeIn 0.2s ease-out;
        }
        
        .login-alert-modal {
          background: white;
          border-radius: 16px;
          padding: 24px;
          width: 90%;
          max-width: 400px;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
          animation: slideUp 0.3s ease-out;
        }
        
        .login-alert-header {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 20px;
          color: #dc2626;
          position: relative;
        }
        
        .login-alert-header i {
          font-size: 24px;
        }
        
        .login-alert-header h3 {
          margin: 0;
          font-size: 20px;
          font-weight: 600;
          color: #1f2937;
          flex: 1;
        }
        
        .close-btn {
          background: none;
          border: none;
          color: #9ca3af;
          cursor: pointer;
          padding: 8px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s;
          font-size: 18px;
        }
        
        .close-btn:hover {
          background: #f3f4f6;
          color: #4b5563;
        }
        
        .login-alert-body {
          margin-bottom: 24px;
        }
        
        .login-alert-body p {
          margin: 0;
          color: #4b5563;
          line-height: 1.5;
          font-size: 15px;
        }
        
        .login-alert-footer {
          display: flex;
          gap: 12px;
        }
        
        .login-alert-btn {
          flex: 1;
          padding: 12px 16px;
          border-radius: 10px;
          font-weight: 600;
          cursor: pointer;
          border: none;
          font-size: 14px;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }
        
        .login-alert-btn.secondary {
          background: #f3f4f6;
          color: #4b5563;
        }
        
        .login-alert-btn.secondary:hover {
          background: #e5e7eb;
        }
        
        .login-alert-btn.primary {
          background: #7c3aed;
          color: white;
        }
        
        .login-alert-btn.primary:hover {
          background: #6d28d9;
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(124, 58, 237, 0.3);
        }
        
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @media (max-width: 480px) {
          .login-alert-modal {
            padding: 20px;
          }
          
          .login-alert-footer {
            flex-direction: column;
          }
          
          .login-alert-header h3 {
            font-size: 18px;
          }
        }
      `}</style>
    </div>
  );
};

export default LoginAlert;