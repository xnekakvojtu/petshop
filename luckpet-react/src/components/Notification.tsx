// src/components/Notification.tsx (Versão ultra clean)
import React, { useEffect, useState } from 'react';

interface NotificationProps {
  message: string;
  type: 'success' | 'error';
  duration?: number;
  onClose: () => void;
}

const Notification: React.FC<NotificationProps> = ({ 
  message, 
  type, 
  duration = 3000, 
  onClose 
}) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onClose, 200);
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 200);
  };

  if (!isVisible) return null;

  return (
    <div className={`notification ${type} ${isVisible ? 'show' : 'hide'}`}>
      <div className="notification-content">
        <div className="notification-icon">
          {type === 'success' ? '✓' : '✕'}
        </div>
        <div className="notification-message">
          {message}
        </div>
        <button 
          className="notification-close"
          onClick={handleClose}
          aria-label="Fechar"
        >
          ×
        </button>
      </div>

      <style >{`
        .notification {
          position: fixed;
          top: 20px;
          right: 20px;
          background: white;
          border-radius: 8px;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.08);
          max-width: 320px;
          z-index: 10000;
          opacity: 0;
          transform: translateY(-20px);
          transition: all 0.25s ease-out;
        }

        .notification.show {
          opacity: 1;
          transform: translateY(0);
        }

        .notification.hide {
          opacity: 0;
          transform: translateY(-20px);
        }

        .notification.success {
          border: 1px solid #00ffe5;
          background: #6900c4e1;
        }

        .notification.error {
          border: 1px solid #fee2e2;
          background: #fef2f2;
        }

        .notification-content {
          display: flex;
          align-items: center;
          padding: 12px 16px;
          gap: 10px;
        }

        .notification-icon {
          flex-shrink: 0;
          width: 20px;
          height: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 14px;
          font-weight: 600;
        }

        .notification.success .notification-icon {
          color: #ffffff;
        }

        .notification.error .notification-icon {
          color: #dc2626;
        }

        .notification-message {
          flex: 1;
          font-size: 14px;
          color: #374151;
          font-weight: 500;
        }

        .notification.success .notification-message {
          color: #ffffff;
        }

        .notification.error .notification-message {
          color: #991b1b;
        }

        .notification-close {
          flex-shrink: 0;
          background: transparent;
          border: none;
          width: 24px;
          height: 24px;
          border-radius: 4px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          color: #9ca3af;
          font-size: 18px;
          transition: all 0.2s;
          padding: 0;
        }

        .notification-close:hover {
          color: #6b7280;
          background: rgba(0, 0, 0, 0.05);
        }

        /* Mobile */
        @media (max-width: 640px) {
          .notification {
            top: 12px;
            right: 12px;
            left: 12px;
            max-width: none;
          }
        }
      `}</style>
    </div>
  );
};

export default Notification;