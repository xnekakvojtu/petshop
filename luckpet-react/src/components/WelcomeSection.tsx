// src/components/WelcomeSection.tsx
import React, { useEffect, useState } from 'react';

interface WelcomeSectionProps {
  onClose?: () => void;
}

const WelcomeSection: React.FC<WelcomeSectionProps> = ({ onClose }) => {
  const [showWelcome, setShowWelcome] = useState(false);

  useEffect(() => {
    const isNewUser = localStorage.getItem('isNewUser');
    const savedUser = localStorage.getItem('user');
    
    if (isNewUser === 'true' && savedUser) {
      setShowWelcome(true);
    }
  }, []);

  const handleClose = () => {
    setShowWelcome(false);
    localStorage.removeItem('isNewUser');
    if (onClose) onClose();
  };

  if (!showWelcome) return null;

  return (
    <div className="welcome-overlay">
      <div className="welcome-modal">
        <button 
          className="close-btn"
          onClick={handleClose}
          aria-label="Fechar"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 6L6 18M6 6l12 12"/>
          </svg>
        </button>
        
        <div className="welcome-content">
          <div className="welcome-icon">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M12 2L9 12l-8 1 6 6-1 8 6-6 6 6-1-8 6-6-8-1-3-10z"/>
            </svg>
          </div>
          
          <h2>Bem-vindo à LuckPet! 🎉</h2>
          <p className="welcome-message">
            Você ganhou <span className="highlight">50 LuckCoins</span> para usar em sua primeira compra!
          </p>
          
          <div className="credits-info">
            <div className="credits-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/>
                <path d="M12 6v6l4 2"/>
              </svg>
            </div>
            <div className="credits-details">
              <h3>Como funcionam os LuckCoins?</h3>
              <ul>
                <li>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                    <path d="M20 6L9 17l-5-5"/>
                  </svg>
                  1 LuckCoin = R$ 1,00 de desconto
                </li>
                <li>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                    <path d="M20 6L9 17l-5-5"/>
                  </svg>
                  Use em qualquer produto
                </li>
                <li>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                    <path d="M20 6L9 17l-5-5"/>
                  </svg>
                  Sem prazo de validade
                </li>
              </ul>
            </div>
          </div>
          
          <button className="explore-btn" onClick={handleClose}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4zM3 6h18M16 10a4 4 0 1 1-8 0"/>
            </svg>
            Começar a Explorar
          </button>
        </div>
      </div>

      <style>{`
        .welcome-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.4);
          backdrop-filter: blur(4px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 20px;
          animation: fadeIn 0.3s ease;
        }

        .welcome-modal {
          background: white;
          border-radius: 20px;
          padding: 32px;
          position: relative;
          max-width: 500px;
          width: 100%;
          animation: slideUp 0.3s ease;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
        }

        .close-btn {
          position: absolute;
          top: 20px;
          right: 20px;
          width: 40px;
          height: 40px;
          border-radius: 12px;
          border: 1px solid #e5e7eb;
          background: white;
          color: #6b7280;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s ease;
        }

        .close-btn:hover {
          background: #f3f4f6;
          border-color: #d1d5db;
        }

        .welcome-content {
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .welcome-icon {
          width: 80px;
          height: 80px;
          background: linear-gradient(135deg, #7c3aed 0%, #5b21b6 100%);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          margin-bottom: 24px;
        }

        h2 {
          font-size: 28px;
          color: #1f2937;
          margin: 0 0 16px 0;
          font-weight: 700;
        }

        .welcome-message {
          color: #6b7280;
          font-size: 16px;
          line-height: 1.5;
          margin: 0 0 32px 0;
          max-width: 400px;
        }

        .highlight {
          color: #7c3aed;
          font-weight: 700;
          background: linear-gradient(135deg, #7c3aed 0%, #5b21b6 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .credits-info {
          display: flex;
          align-items: flex-start;
          gap: 16px;
          background: #f8fafc;
          padding: 20px;
          border-radius: 16px;
          margin-bottom: 32px;
          text-align: left;
          width: 100%;
          border: 1px solid #f1f5f9;
        }

        .credits-icon {
          width: 40px;
          height: 40px;
          background: #fef3c7;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #f59e0b;
          flex-shrink: 0;
        }

        .credits-details {
          flex: 1;
        }

        .credits-details h3 {
          font-size: 16px;
          color: #1f2937;
          margin: 0 0 12px 0;
          font-weight: 600;
        }

        .credits-details ul {
          list-style: none;
          padding: 0;
          margin: 0;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .credits-details li {
          display: flex;
          align-items: center;
          gap: 8px;
          color: #4b5563;
          font-size: 14px;
          line-height: 1.4;
        }

        .credits-details li svg {
          color: #10b981;
          flex-shrink: 0;
        }

        .explore-btn {
          width: 100%;
          background: linear-gradient(135deg, #7c3aed 0%, #5b21b6 100%);
          color: white;
          border: none;
          padding: 16px;
          border-radius: 12px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          transition: all 0.2s ease;
        }

        .explore-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(124, 58, 237, 0.4);
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

        @media (max-width: 640px) {
          .welcome-modal {
            padding: 24px;
          }
          
          h2 {
            font-size: 24px;
          }
          
          .welcome-message {
            font-size: 15px;
          }
          
          .credits-info {
            flex-direction: column;
            align-items: center;
            text-align: center;
          }
          
          .credits-details {
            text-align: center;
          }
          
          .credits-details li {
            justify-content: center;
          }
        }

        @media (max-width: 480px) {
          .welcome-overlay {
            padding: 16px;
          }
          
          .welcome-modal {
            padding: 20px;
          }
          
          h2 {
            font-size: 22px;
          }
          
          .welcome-icon {
            width: 64px;
            height: 64px;
            margin-bottom: 20px;
          }
        }
      `}</style>
    </div>
  );
};

export default WelcomeSection;