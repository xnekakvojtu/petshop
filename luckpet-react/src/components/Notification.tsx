// src/components/Notification.tsx (Versão clean e minimalista)
import React, { useEffect, useState } from 'react';

interface NotificationProps {
  message: string;
  type: 'success' | 'error' | 'info';
  duration?: number;
  onClose: () => void;
}

const Notification: React.FC<NotificationProps> = ({ 
  message, 
  type, 
  duration = 4000, 
  onClose 
}) => {
  const [isVisible, setIsVisible] = useState(true);
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    const interval = 50;
    const totalSteps = duration / interval;
    const decrement = 100 / totalSteps;
    
    const progressTimer = setInterval(() => {
      setProgress(prev => {
        const next = prev - decrement;
        return next < 0 ? 0 : next;
      });
    }, interval);

    const closeTimer = setTimeout(() => {
      handleClose();
    }, duration);

    return () => {
      clearInterval(progressTimer);
      clearTimeout(closeTimer);
    };
  }, [duration]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 200);
  };

  if (!isVisible) return null;

  const typeConfig = {
    success: {
      icon: '✓',
      bgColor: '#f0fdf4',
      borderColor: '#bbf7d0',
      textColor: '#166534',
      iconColor: '#22c55e'
    },
    error: {
      icon: '✕',
      bgColor: '#fef2f2',
      borderColor: '#fecaca',
      textColor: '#991b1b',
      iconColor: '#ef4444'
    },
    info: {
      icon: 'ⓘ',
      bgColor: '#f0f9ff',
      borderColor: '#bae6fd',
      textColor: '#0369a1',
      iconColor: '#0ea5e9'
    }
  };

  const config = typeConfig[type];

  return (
    <div 
      className="notification"
      style={{ 
        '--bg-color': config.bgColor,
        '--border-color': config.borderColor,
        '--text-color': config.textColor,
        '--icon-color': config.iconColor,
        '--progress': `${progress}%`
      } as React.CSSProperties}
    >
      <div className="notification-content">
        <div className="notification-icon">
          {config.icon}
        </div>
        
        <div className="notification-message">
          {message}
        </div>

        <button 
          className="notification-close"
          onClick={handleClose}
          aria-label="Fechar"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>

      <div className="notification-progress" />

      <style>{`
        .notification {
          position: fixed;
          top: 20px;
          right: 20px;
          background: var(--bg-color);
          border: 1px solid var(--border-color);
          border-radius: 10px;
          box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
          max-width: 350px;
          min-width: 280px;
          z-index: 10000;
          overflow: hidden;
          animation: slideIn 0.3s ease-out forwards;
        }

        .notification-content {
          display: flex;
          align-items: flex-start;
          padding: 14px 16px;
          gap: 12px;
          position: relative;
        }

        .notification-icon {
          flex-shrink: 0;
          width: 22px;
          height: 22px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
          font-weight: 600;
          color: white;
          background: var(--icon-color);
          margin-top: 2px;
        }

        .notification-message {
          flex: 1;
          font-size: 14px;
          line-height: 1.4;
          color: var(--text-color);
          font-weight: 500;
          padding-right: 8px;
        }

        .notification-close {
          flex-shrink: 0;
          width: 24px;
          height: 24px;
          border-radius: 6px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          background: transparent;
          border: none;
          color: #94a3b8;
          transition: all 0.15s ease;
          padding: 0;
          margin-top: -2px;
        }

        .notification-close:hover {
          background: rgba(0, 0, 0, 0.05);
          color: #64748b;
        }

        .notification-progress {
          position: absolute;
          bottom: 0;
          left: 0;
          width: var(--progress);
          height: 2px;
          background: var(--icon-color);
          transition: width 50ms linear;
        }

        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateX(100%) translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateX(0) translateY(0);
          }
        }

        /* Mobile */
        @media (max-width: 640px) {
          .notification {
            top: 16px;
            right: 16px;
            left: 16px;
            max-width: none;
            min-width: auto;
            animation: slideInMobile 0.3s ease-out forwards;
          }

          @keyframes slideInMobile {
            from {
              opacity: 0;
              transform: translateY(-20px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
        }

        /* Small screens */
        @media (max-width: 400px) {
          .notification-content {
            padding: 12px 14px;
            gap: 10px;
          }
          
          .notification-message {
            font-size: 13.5px;
          }
          
          .notification-icon {
            width: 20px;
            height: 20px;
            font-size: 11px;
          }
        }

        /* Extra small screens */
        @media (max-width: 350px) {
          .notification {
            top: 12px;
            right: 12px;
            left: 12px;
          }
          
          .notification-content {
            padding: 10px 12px;
          }
          
          .notification-message {
            font-size: 13px;
          }
          
          .notification-close {
            width: 20px;
            height: 20px;
          }
          
          .notification-close svg {
            width: 10px;
            height: 10px;
          }
        }
      `}</style>
    </div>
  );
};

export default Notification;